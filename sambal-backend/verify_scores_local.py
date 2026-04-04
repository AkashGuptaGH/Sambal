"""
Offline verification of scoring logic — no server needed.
Mirrors exactly what main_v2.py risk_profile() does.
"""

CITY_TIER = {
    "Mumbai": 1, "Delhi": 1, "Bangalore": 1,
    "Hyderabad": 2, "Chennai": 2, "Kolkata": 2, "Pune": 2,
    "Jaipur": 3, "Lucknow": 3, "Bhopal": 3, "Surat": 3, "Nagpur": 3,
}
PERSONA_MAP = {"food_delivery": 0, "grocery": 1, "ride_hailing": 2, "logistics": 3}
ZONE_MULT = {0: 1.0, 1: 1.2, 2: 1.5, 3: 2.0}

def calc_score(city, delivery_zone, persona, avg_daily_earn, weekly_hours, month):
    city_tier  = CITY_TIER.get(city, 2)
    persona_id = PERSONA_MAP.get(persona, 0)
    tenure_months = int(max(1, min(36, (avg_daily_earn - 300) / 60)))

    base = 22 + (3 - city_tier) * 10
    base += delivery_zone * 3
    base += max(0, (1500 - avg_daily_earn) / 1500 * 18)
    base += max(0, (weekly_hours - 40) / 30 * 8)

    if month in [6, 7, 8, 9]:    base += 14
    elif month in [4, 5]:         base += 6
    elif month in [11, 12, 1]:    base -= 4

    if persona_id == 0:   base += 6
    elif persona_id == 2: base += 3

    base += max(0, (6 - tenure_months) * 1.2)

    score = round(max(28.0, min(94.0, base)), 1)

    if score < 42:    zone_label = 0
    elif score < 60:  zone_label = 1
    elif score < 75:  zone_label = 2
    else:             zone_label = 3

    return score, zone_label + 1, ZONE_MULT[zone_label]

test_cases = [
    ("Mumbai",    3, "food_delivery", 800,  40, 4),
    ("Delhi",     1, "food_delivery", 1500, 60, 4),
    ("Chennai",   5, "food_delivery", 500,  25, 7),
    ("Hyderabad", 2, "food_delivery", 1200, 50, 6),
    ("Kolkata",   4, "food_delivery", 700,  35, 8),
    ("Jaipur",    1, "food_delivery", 1800, 30, 12),  # low risk
    ("Bangalore", 5, "food_delivery", 400,  65, 8),   # very high risk
    ("Pune",      2, "ride_hailing",  1000, 45, 3),
]

print(f"{'City':<12} {'Zone':>5} {'Earn':>6} {'Mon':>4} | {'Score':>6} {'RiskZone':>9} {'Mult':>7}")
print("-" * 55)
for c, z, p, e, h, m in test_cases:
    score, risk_zone, mult = calc_score(c, z, p, e, h, m)
    print(f"{c:<12} {z:>5} {e:>6} {m:>4} | {score:>6.1f}  Zone {risk_zone}   {mult:.2f}x")
