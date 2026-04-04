import requests, json

BASE = "http://127.0.0.1:8000/api/onboard/risk-profile"

test_cases = [
    {"city": "Mumbai",    "delivery_zone": 3, "persona": "food_delivery", "avg_daily_earn": 800,  "weekly_hours": 40, "month": 4},
    {"city": "Delhi",     "delivery_zone": 1, "persona": "food_delivery", "avg_daily_earn": 1500, "weekly_hours": 60, "month": 4},
    {"city": "Chennai",   "delivery_zone": 5, "persona": "food_delivery", "avg_daily_earn": 500,  "weekly_hours": 25, "month": 7},
    {"city": "Hyderabad", "delivery_zone": 2, "persona": "food_delivery", "avg_daily_earn": 1200, "weekly_hours": 50, "month": 6},
    {"city": "Kolkata",   "delivery_zone": 4, "persona": "food_delivery", "avg_daily_earn": 700,  "weekly_hours": 35, "month": 8},
]

print(f"{'City':<12} {'Zone':>5} {'Earn':>6} {'Month':>6} | {'Risk Score':>10} {'Zone Label':>10} {'Multiplier':>10}")
print("-" * 65)
for t in test_cases:
    r = requests.post(BASE, json=t)
    if r.ok:
        d = r.json()
        print(f"{t['city']:<12} {t['delivery_zone']:>5} {t['avg_daily_earn']:>6} {t['month']:>6} | {d['risk_score']:>10.1f} {d['risk_zone']:>10} {d['zone_multiplier']:>10.2f}x")
    else:
        print(f"{t['city']:<12} ERROR: {r.status_code} {r.text}")
