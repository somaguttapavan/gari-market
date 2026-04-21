import io
import base64

try:
    from PIL import Image, ImageStat
    import numpy as np
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

def analyze_quality(image_base64: str, crop_type: str) -> dict:
    """
    Performs heuristic-based quality analysis on an image.
    Currently supports: Tomato
    """
    if not PIL_AVAILABLE:
        return {
            "crop": crop_type,
            "quality": "Unknown",
            "confidence": 0,
            "advice": "Image processing unavailable: Pillow (PIL) is not installed."
        }
    
    try:
        # Decode base64 image
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        # Strip all whitespace, newlines, etc. that might corrupt decoding
        image_base64 = "".join(image_base64.split())
        
        try:
            image_data = base64.b64decode(image_base64)
            img = Image.open(io.BytesIO(image_data)).convert('RGB')
        except Exception as img_err:
            print(f"PIL Error: {img_err}")
            # Log some of the header to debug
            print(f"Base64 snippet: {image_base64[:100]}...")
            if len(image_base64) > 100:
                print(f"Base64 end snippet: {image_base64[-50:]}")
            raise Exception(f"Invalid image format or corrupted data. (PIL: {img_err})")
        
        # Resize for faster processing
        img.thumbnail((300, 300))
        
        # Convert to numpy for easier manipulation
        img_array = np.array(img)
        
        # Basic Heuristic for Tomato Quality
        if crop_type.lower() == "tomato":
            return analyze_tomato(img_array)
        
        # Fallback for other crops (General health based on brightness/contrast)
        return analyze_general(img_array, crop_type)

    except Exception as e:
        print(f"Quality Analysis Error: {e}")
        return {
            "crop": crop_type,
            "quality": "Unknown",
            "confidence": 0,
            "advice": f"Error analyzing image: {str(e)}"
        }

import sys

def analyze_tomato(img_array):
    """
    Analyzes tomato quality based on color distribution.
    Now uses relative areas to better handle small subjects or dark backgrounds.
    """
    # RGB Channels
    r = img_array[:, :, 0].astype(float)
    g = img_array[:, :, 1].astype(float)
    b = img_array[:, :, 2].astype(float)
    
    # Define "Subject" (anything not near-black background)
    subject_mask = (r > 50) | (g > 50) | (b > 50)
    subject_pixels = np.sum(subject_mask)
    total_pixels = img_array.shape[0] * img_array.shape[1]
    
    # If no subject detected, assume the whole image is of interest
    if subject_pixels < total_pixels * 0.05:
        subject_pixels = total_pixels
        subject_mask = np.ones_like(r, dtype=bool)

    # Calculate "Redness" - where R is higher than G and B
    # Relaxed from 1.2 to 1.1 multiplier
    red_mask = (r > g * 1.1) & (r > b * 1.1) & (r > 50)
    red_ratio = np.sum(red_mask) / subject_pixels
    
    # Calculate "Darkness/Rot" ONLY within the subject area
    dark_mask = (r < 70) & (g < 50) & (b < 50) & subject_mask
    dark_ratio = np.sum(dark_mask) / subject_pixels
    
    print(f"DEBUG Quality (Tomato): subject_pixels={subject_pixels}, red_ratio={red_ratio:.4f}, dark_ratio={dark_ratio:.4f}", flush=True)

    # Base state
    quality = "Good"
    confidence = 0.88
    advice = "Your tomato looks fresh and ready!"

    # Smart Decision Logic
    if dark_ratio > 0.25: # More than 25% of the FRUIT is dark
        quality = "Bad"
        confidence = 0.95
        advice = "Significant dark spots or rot detected on the product."
    elif red_ratio < 0.15: # Less than 15% of the FRUIT is red
        quality = "Moderate"
        confidence = 0.85
        advice = "The tomato appears under-ripe or lacks typical red coloration."
        if dark_ratio > 0.15:
             quality = "Bad"
             advice = "Low redness and high dark spots suggest poor quality."
    elif red_ratio > 0.5:
        quality = "Good"
        confidence = 0.98
        advice = "Excellent color and texture detected!"

    return {
        "crop": "Tomato",
        "quality": quality,
        "confidence": round(confidence * 100, 2),
        "advice": advice
    }

def analyze_general(img_array, crop_type):
    # Basic brightness/contrast check
    img = Image.fromarray(img_array)
    stat = ImageStat.Stat(img)
    brightness = sum(stat.mean) / 3
    
    print(f"DEBUG Quality (General): crop={crop_type}, brightness={brightness:.2f}")

    quality = "Good" if brightness > 50 else "Bad" # Decreased from 80
    confidence = 75.0
    advice = f"General assessment for {crop_type}: Product looks {'acceptable' if quality == 'Good' else 'dull or low quality'}."
    
    return {
        "crop": crop_type,
        "quality": quality,
        "confidence": confidence,
        "advice": advice
    }
