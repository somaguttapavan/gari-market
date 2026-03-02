# Global ML Model Loader
try:
    import joblib
    import pandas as pd
    import os
    
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "crop_model.pkl")
    if os.path.exists(MODEL_PATH):
        ML_MODEL = joblib.load(MODEL_PATH)
        print(f"ML Model loaded from {MODEL_PATH}")
    else:
        ML_MODEL = None
        print(f"Warning: ML Model not found at {MODEL_PATH}")
except Exception as e:
    ML_MODEL = None
    print(f"Failed to load ML Model: {e}")

def analyze_soil(data: dict) -> dict:
    """
    Analyzes soil parameters and returns actionable agricultural recommendations.
    ...
    """
    
    # --- 1. Validation ---
    required_fields = ['ph', 'nitrogen', 'phosphorus', 'potassium', 'moisture', 'organic_carbon', 'crop']
    for field in required_fields:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
            
    try:
        ph = float(data['ph'])
        n = float(data['nitrogen'])
        p = float(data['phosphorus'])
        k = float(data['potassium'])
        m = float(data['moisture'])
        oc = float(data['organic_carbon'])
    except (ValueError, TypeError):
        raise ValueError("Soil parameters must be numeric values.")

    if not (0 <= ph <= 14): raise ValueError("pH must be between 0 and 14")
    if not (0 <= m <= 100): raise ValueError("Moisture must be between 0 and 100")
    if any(val < 0 for val in [n, p, k, oc]): raise ValueError("Nutrient values cannot be negative")

    crop_name = str(data['crop']).lower()

    # --- 2. Standards & Thresholds ---
    # General standards for classification (mg/kg for NPK, % for OC)
    standards = {
        'nitrogen': {'low': 280, 'high': 560},
        'phosphorus': {'low': 10, 'high': 25},
        'potassium': {'low': 108, 'high': 280},
        'organic_carbon': {'low': 0.5, 'high': 0.75}
    }

    # Crop specific optimal ranges (Simplified knowledge base)
    # Crop specific optimal ranges (Simplified knowledge base)
    crop_profiles = {
        'tomato': {'ph': (6.0, 6.8), 'n': 'high', 'p': 'medium', 'k': 'high'},
        'rice': {'ph': (5.5, 7.0), 'n': 'high', 'p': 'medium', 'k': 'medium'},
        'potato': {'ph': (4.8, 5.5), 'n': 'high', 'p': 'medium', 'k': 'high'},
        # Add more vegetables
        'chili': {'ph': (6.0, 7.0), 'n': 'medium', 'p': 'medium', 'k': 'high'},
        'spinach': {'ph': (6.0, 7.0), 'n': 'high', 'p': 'medium', 'k': 'medium'},
        'carrot': {'ph': (5.5, 6.5), 'n': 'medium', 'p': 'medium', 'k': 'high'},
        'eggplant': {'ph': (5.5, 6.8), 'n': 'high', 'p': 'medium', 'k': 'high'},
        'cabbage': {'ph': (6.0, 6.5), 'n': 'high', 'p': 'medium', 'k': 'medium'},
        'onion': {'ph': (6.0, 7.0), 'n': 'medium', 'p': 'medium', 'k': 'high'},
    }
    
    # Default profile if crop not found
    target_profile = crop_profiles.get(crop_name, {'ph': (6.0, 7.5), 'n': 'medium', 'p': 'medium', 'k': 'medium'})

    # --- 3. Analysis Logic ---
    def classify(value, low, high):
        if value < low: return 'Low'
        if value > high: return 'High'
        return 'Medium'

    status_n = classify(n, standards['nitrogen']['low'], standards['nitrogen']['high'])
    status_p = classify(p, standards['phosphorus']['low'], standards['phosphorus']['high'])
    status_k = classify(k, standards['potassium']['low'], standards['potassium']['high'])
    status_oc = classify(oc, standards['organic_carbon']['low'], standards['organic_carbon']['high'])

    deficiencies = []
    recommendations = []
    advisory_notes = []
    score = 100

    # --- 4. Deficiency Detection & Scoring ---
    
    # pH Analysis
    opt_min, opt_max = target_profile['ph']
    if ph < opt_min:
        score -= 15
        deficiencies.append("Acidity (Low pH)")
        recommendations.append({
            "fertilizer": "Agricultural Lime",
            "quantity": "2-3 tons/ha",
            "application_time": "2-3 months before planting"
        })
    elif ph > opt_max:
        score -= 15
        deficiencies.append("Alkalinity (High pH)")
        recommendations.append({
            "fertilizer": "Gypsum or Elemental Sulfur",
            "quantity": "As per extension advice",
            "application_time": "Pre-planting"
        })

    # Nitrogen Analysis
    if status_n == 'Low' or (target_profile['n'] == 'high' and status_n == 'Medium'):
        score -= 10
        deficiencies.append("Nitrogen Deficiency")
        recommendations.append({
            "fertilizer": "Urea or Compost",
            "quantity": "100-120 kg/ha split dose",
            "application_time": "Basal + Vegetative stage"
        })
    elif status_n == 'High':
         advisory_notes.append("Soil Nitrogen is high. Reduce nitrogenous fertilizers to prevent leaching.")

    # Phosphorus Analysis
    if status_p == 'Low':
        score -= 10
        deficiencies.append("Phosphorus Deficiency")
        recommendations.append({
            "fertilizer": "Single Super Phosphate (SSP)",
            "quantity": "50-60 kg/ha",
            "application_time": "At planting (Basal)"
        })

    # Potassium Analysis
    if status_k == 'Low' or (target_profile['k'] == 'high' and status_k == 'Medium'):
        score -= 10
        deficiencies.append("Potassium Deficiency")
        recommendations.append({
            "fertilizer": "Muriate of Potash (MOP)",
            "quantity": "40-50 kg/ha",
            "application_time": "Split dose: Basal + Flowering"
        })

    # Organic Carbon Analysis (Indicator of soil health)
    if status_oc == 'Low':
        score -= 15
        deficiencies.append("Low Organic Matter")
        advisory_notes.append("Incorporate Farm Yard Manure (FYM) or green manure to improve soil structure.")
    
    # Moisture sanity check
    if m < 20:
        score -= 5
        advisory_notes.append("Soil moisture is critically low. Ensure adequate irrigation.")

    # --- 5. AI Crop Recommendation (ML + Rule Based) ---
    ai_recommendations = []
    
    # A. ML Predictions (Field Crops)
    if ML_MODEL:
        try:
            # Map Climate to environmental Approximate values
            # Tropical: Hot, Humid, High Rain
            # Temperate: Mild, Moderate Rain
            # Dry: Hot, Low Humid, Low Rain
            env_map = {
                'Tropical': {'t': 28, 'h': 80, 'r': 200},
                'Temperate': {'t': 22, 'h': 60, 'r': 100},
                'Dry': {'t': 35, 'h': 30, 'r': 40}
            }
            # Default to Tropical if unknown or missing
            env = env_map.get(str(data.get('location', 'Tropical')), env_map['Tropical'])
            
            # Prepare input dataframe for model
            # Feature order must match training: N, P, K, temperature, humidity, ph, rainfall
            input_df = pd.DataFrame([{
                'N': n,
                'P': p,
                'K': k,
                'temperature': env['t'],
                'humidity': env['h'],
                'ph': ph,
                'rainfall': env['r']
            }])
            
            # Predict Probabilities to get top 3
            probs = ML_MODEL.predict_proba(input_df)[0]
            classes = ML_MODEL.classes_
            
            # Get top 3 indices
            top3_indices = probs.argsort()[-3:][::-1]
            for idx in top3_indices:
                if probs[idx] > 0.1: # Threshold to avoid very low prob predictions
                    ai_recommendations.append(classes[idx])
                    
        except Exception as e:
            print(f"ML Prediction failed: {e}")
            pass

    # --- 6. Result Formatting ---
    score = max(0, score) # Clamp score
    
    if score >= 80: soil_status = "Good"
    elif score >= 50: soil_status = "Moderate"
    else: soil_status = "Poor"

    # B. Rule-Based Vegetable Recommendations (Supplemental)
    # Check if soil is generally suitable for vegetables
    vegetable_candidates = []
    
    # Logic: Recommend veggies based on specific nutrient strengths
    if 5.5 <= ph <= 7.5:
        # Nitrogen lovers (Leafy)
        if status_n == 'High': vegetable_candidates.extend(['Spinach', 'Cabbage', 'Lettuce'])
        elif status_n == 'Medium': vegetable_candidates.append('Fenugreek')
        
        # Phosphorus/Potassium lovers (Root/Fruit)
        if status_p == 'High' or status_k == 'High': 
            vegetable_candidates.extend(['Tomato', 'Eggplant', 'Chili', 'Capsicum'])
        
        # Root veggies (need loose soil, often P/K)
        if status_p == 'Medium' and status_k == 'Medium':
            vegetable_candidates.extend(['Carrot', 'Radish', 'Onion'])
            
        # General purpose if soil is good
        if soil_status == 'Good':
            vegetable_candidates.extend(['Okra', 'Beans', 'Bottle Gourd'])

    # Deduplicate and limit
    vegetable_candidates = list(set(vegetable_candidates))[:5]

    if 'High' in [status_n, status_p, status_k]:
         advisory_notes.append("Sustainable Farming: Monitor nutrient levels to minimize environmental impact.")

    return {
        "soil_health_score": int(score),
        "soil_status": soil_status,
        "deficiencies": deficiencies,
        "recommendations": recommendations,
        "advisory_notes": advisory_notes,
        "ai_crop_recommendations": ai_recommendations,
        "vegetable_recommendations": vegetable_candidates
    }
