import io
import base64
from PIL import Image
import sys

def test_decode(b64_str):
    try:
        if "," in b64_str:
            b64_str = b64_str.split(",")[1]
        
        # Clean the string from possible whitespace
        b64_str = "".join(b64_str.split())
        
        image_data = base64.b64decode(b64_str)
        print(f"Decoded size: {len(image_data)} bytes")
        
        img = Image.open(io.BytesIO(image_data))
        print(f"Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

# Test with a tiny valid red dot PNG base64
valid_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
print("Testing valid PNG:")
test_decode(valid_png)

# Test with partial/broken data
broken_data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ"
print("\nTesting broken data:")
test_decode(broken_data)
