import base64
import os
from quality_service import analyze_quality

def test_user_image():
    image_path = r"C:/Users/DEll/.gemini/antigravity/brain/76cd2936-88ff-47ca-b633-8b4afa4b39d5/uploaded_media_1772967419326.png"
    
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    print(f"Testing quality analysis on: {image_path}")
    
    with open(image_path, "rb") as f:
        image_bytes = f.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    
    result = analyze_quality(image_base64, "Tomato")
    
    print("\n--- Analysis Result ---")
    print(f"Crop: {result['crop']}")
    print(f"Quality: {result['quality']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Advice: {result['advice']}")
    
    if result['quality'] == "Bad":
        print("\nVerification SUCCESS: The bad quality product was correctly identified.")
    else:
        print("\nVerification FAILED: The product was still labeled as " + result['quality'])

if __name__ == "__main__":
    test_user_image()
