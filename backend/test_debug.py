from soil_service import analyze_soil
import sys

try:
    print("Testing analyze_soil...")
    data = {
        "ph": 6.5,
        "nitrogen": 200,
        "phosphorus": 20,
        "potassium": 100,
        "crop": "tomato",
        "location": "Tropical",
        "moisture": 50,
        "organic_carbon": 0.5
    }
    result = analyze_soil(data)
    print("Optimization Result:", result)
    print("Success!")
except Exception as e:
    print("Crashed:", e)
    import traceback
    traceback.print_exc()
