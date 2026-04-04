import pickle
with open("sambal_ai_v3.pkl", "rb") as f:
    bundle = pickle.load(f)
print("CITY_TIER:", bundle.get("city_tier_map"))
print("PERSONA_MAP:", bundle.get("persona_map"))
print("MODEL_VERSION:", bundle.get("version"))
