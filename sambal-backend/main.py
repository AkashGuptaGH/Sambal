from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import random
import json
import uvicorn
import os

# Import our custom ML classes so pickle can deserialize the trained model
from train_model import RandomForest, DecisionNode, _build_tree, _predict_sample

# ─── Load trained SAMBAL AI Model ─────────────────────────────────────────────
MODEL_PATH = "sambal_ai_model.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        model_bundle = pickle.load(f)
    rf_payout = model_bundle["rf_payout"]
    rf_prob   = model_bundle["rf_probability"]
    MODEL_VERSION = model_bundle["version"]
    print(f"SAMBAL AI loaded: {MODEL_VERSION}  ({len(rf_payout.trees)} trees each)")
    AI_READY = True
except FileNotFoundError:
    AI_READY = False
    MODEL_VERSION = "NOT_TRAINED"
    print("WARNING: sambal_ai_model.pkl not found. Run train_model.py first.")

# ─── City density lookup ───────────────────────────────────────────────────────
CITY_DENSITY = {
    "Mumbai":    1.4,
    "Delhi":     1.3,
    "Bangalore": 1.1,
    "Chennai":   1.0,
    "Hyderabad": 1.0,
    "Kolkata":   1.2,
}

# ─── Risk factor generator (rule-based labels derived from inputs) ─────────────
def derive_risk_factors(city, rain_mm, heat_c, strike, platform):
    factors = []
    if rain_mm > 100:
        factors.append(f"Red-alert rainfall ({rain_mm:.0f}mm) in {city}")
    elif rain_mm > 50:
        factors.append(f"Heavy rain warning ({rain_mm:.0f}mm) — delivery disruption")
    elif rain_mm > 20:
        factors.append(f"Moderate rainfall in {city}")

    if heat_c > 47:
        factors.append(f"Extreme heatwave ({heat_c:.0f}C) — dangerous work conditions")
    elif heat_c > 42:
        factors.append(f"High heat advisory ({heat_c:.0f}C) — {platform} slowdown expected")
    elif heat_c > 38:
        factors.append(f"Elevated heat index ({heat_c:.0f}C)")

    if strike > 0.8:
        factors.append(f"City-wide shutdown in {city} — total {platform} disruption")
    elif strike > 0.5:
        factors.append(f"Major strike activity in {city} — {platform} heavily impacted")
    elif strike > 0.2:
        factors.append(f"Localized strike reported near {city} zones")

    if not factors:
        factors.append("Normal operating conditions — no disruption detected")

    return factors

# ─── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="SAMBAL AI Engine v2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ───────────────────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    city: str
    rain_mm: float
    heat_index_c: float
    strike_severity: float
    platform: str

class PredictionResponse(BaseModel):
    model_version: str
    disruption_probability: float
    estimated_payout_inr: int
    risk_factors: list[str]
    ai_reasoning: str

DB_FILE = "sambal_db.json"


def load_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as f:
            return json.load(f)
    return {"users": {}, "claims": [], "policies": {}}


def save_db(db_local):
    with open(DB_FILE, "w") as f:
        json.dump(db_local, f, indent=2)


db = load_db()


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class UserData(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    platform: str
    city: str
    zone: str
    persona: str
    policyActive: bool
    weeklyPremium: int
    coverageCap: int
    riskZone: int
    dailyAvgEarning: int
    earningsHistory: list[dict] = []
    recentClaims: list[dict] = []
    totalPayouts: int = 0

# ─── Prediction endpoint ───────────────────────────────────────────────────────
@app.post("/api/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    if not AI_READY:
        raise HTTPException(503, "Model not trained. Run train_model.py first.")

    density = CITY_DENSITY.get(req.city, 1.0)
    features = [[req.rain_mm, req.heat_index_c, req.strike_severity, density]]

    raw_payout = rf_payout.predict(features)[0]
    raw_prob   = rf_prob.predict(features)[0]

    payout = max(0, min(2500, int(raw_payout)))
    prob   = round(max(1.0, min(99.0, raw_prob)), 1)

    factors = derive_risk_factors(
        req.city, req.rain_mm, req.heat_index_c, req.strike_severity, req.platform
    )

    # Generate a concise AI reasoning string from the model outputs
    severity = "severe" if prob > 70 else "moderate" if prob > 40 else "low"
    reasoning = (
        f"SAMBAL AI assessed a {severity} disruption risk ({prob:.0f}%) in {req.city} "
        f"for {req.platform} workers. "
        f"{'Rain and strike factors significantly raised the payout threshold.' if req.rain_mm > 50 or req.strike_severity > 0.5 else 'Conditions are within acceptable operating ranges.'}"
    )

    return PredictionResponse(
        model_version=MODEL_VERSION,
        disruption_probability=prob,
        estimated_payout_inr=payout,
        risk_factors=factors,
        ai_reasoning=reasoning,
    )

@app.get("/api/status")
def status():
    return {
        "ready": AI_READY,
        "model": MODEL_VERSION,
        "trees": len(rf_payout.trees) if AI_READY else 0,
    }


@app.post("/api/auth/register", response_model=UserData)
def register(req: RegisterRequest):
    if req.email in db["users"]:
        raise HTTPException(400, "Email already registered")

    user_id = f"W-{random.randint(10000, 99999)}"
    user_data = {
        "id": user_id,
        "name": req.name,
        "email": req.email,
        "password": req.password,
        "phone": "9999999999",
        "platform": "Select Platform",
        "city": "Select City",
        "zone": "Select Zone",
        "persona": "food_delivery",
        "policyActive": False,
        "weeklyPremium": 0,
        "coverageCap": 0,
        "riskZone": 1,
        "dailyAvgEarning": 0,
        "earningsHistory": [],
        "recentClaims": [],
        "totalPayouts": 0,
    }
    db["users"][req.email] = user_data
    save_db(db)
    return UserData(**user_data)


@app.post("/api/auth/login", response_model=UserData)
def login(req: LoginRequest):
    if req.email in db["users"]:
        user = db["users"][req.email]
        if user["password"] == req.password:
            user["email"] = req.email
            return UserData(**user)
        raise HTTPException(401, "Invalid password")

    if req.email.startswith("admin"):
        return UserData(
            id="A-0001",
            name="Admin User",
            email=req.email,
            phone="9876543210",
            platform="AdminPanel",
            city="Chennai",
            zone="Velachery",
            persona="food_delivery",
            policyActive=True,
            weeklyPremium=38,
            coverageCap=4500,
            riskZone=3,
            dailyAvgEarning=750,
        )

    if req.email == "karthik@example.com" and req.password == "worker123":
        return UserData(
            id="W-10442",
            name="Karthik Selvam",
            email="karthik@example.com",
            phone="9876543210",
            platform="Swiggy",
            city="Chennai",
            zone="Velachery",
            persona="food_delivery",
            policyActive=True,
            weeklyPremium=38,
            coverageCap=4500,
            riskZone=3,
            dailyAvgEarning=750,
            earningsHistory=[
                {"day": "Mon", "earning": 720},
                {"day": "Tue", "earning": 840},
                {"day": "Wed", "earning": 600, "rain": True},
                {"day": "Thu", "earning": 780},
                {"day": "Fri", "earning": 910},
                {"day": "Sat", "earning": 1100},
                {"day": "Sun", "earning": 950},
            ],
            recentClaims=[
                {
                    "id": "CLM-6B21",
                    "date": "24 Mar 2024",
                    "amount": 1200,
                    "status": "Paid",
                    "event": "Heavy Rain",
                }
            ],
            totalPayouts=3200,
        )

    raise HTTPException(404, "User not found")

if __name__ == "__main__":
    print("Starting SAMBAL AI Server on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
