import requests
import json

url = "http://localhost:8000/api/analyze-soil"

data = {
    "ph": 6.5,
    "nitrogen": 400,
    "phosphorus": 20,
    "potassium": 200,
    "moisture": 50,
    "organic_carbon": 0.5,
    "crop": "tomato"
}

try:
    print(f"Sending POST request to {url}...")
    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        print("\nSuccess! Response:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"\nError: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"\nConnection Failed: {e}")
    print("Make sure the backend server is running (uvicorn backend.main:app --reload)")
