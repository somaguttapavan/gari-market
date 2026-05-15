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
    Analyzes color ratios, dark rot patches, and texture signals to detect
    fresh vs rotten/roasted/cooked vegetables.
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
            raise Exception(f"Invalid image format or corrupted data. (PIL: {img_err})")

        # Resize for consistent processing
        img = img.resize((300, 300))

        # Convert to numpy for analysis
        img_array = np.array(img)

        crop_lower = crop_type.lower()

        if crop_lower == "tomato":
            return analyze_tomato(img_array)
        elif crop_lower in ["onion", "potato", "garlic"]:
            return analyze_root_vegetable(img_array, crop_type)
        elif crop_lower in ["brinjal", "eggplant"]:
            return analyze_brinjal(img_array)
        elif crop_lower in ["cabbage", "spinach", "lettuce"]:
            return analyze_leafy(img_array, crop_type)
        else:
            return analyze_general(img_array, crop_type)

    except Exception as e:
        print(f"Quality Analysis Error: {e}")
        return {
            "crop": crop_type,
            "quality": "Unknown",
            "confidence": 0,
            "advice": f"Error analyzing image: {str(e)}"
        }


def analyze_tomato(img_array):
    """
    Analyzes tomato quality using multi-signal heuristic:
    - Red ratio: healthy tomatoes are dominantly red
    - Dark ratio: rot shows as dark patches
    - Shriveled/cooked signal: combination of high darkness on stems + uneven texture
    - Desaturation: rotten or cooked tomatoes lose uniform saturation
    """
    r = img_array[:, :, 0].astype(float)
    g = img_array[:, :, 1].astype(float)
    b = img_array[:, :, 2].astype(float)

    # Subject mask: exclude near-black background
    subject_mask = (r > 40) | (g > 40) | (b > 40)
    subject_pixels = np.sum(subject_mask)
    total_pixels = img_array.shape[0] * img_array.shape[1]

    if subject_pixels < total_pixels * 0.05:
        subject_pixels = total_pixels
        subject_mask = np.ones_like(r, dtype=bool)

    if subject_pixels == 0:
        return {
            "crop": "Tomato",
            "quality": "Unknown",
            "confidence": 0,
            "advice": "Unable to detect subject in image. Please ensure good lighting."
        }

    # --- Signal 1: Redness ratio (fresh tomatoes have >40% red pixels) ---
    red_mask = (r > g * 1.15) & (r > b * 1.15) & (r > 80) & subject_mask
    red_ratio = np.sum(red_mask) / subject_pixels

    # --- Signal 2: Dark/rot patches within the subject ---
    dark_mask = (r < 80) & (g < 60) & (b < 60) & subject_mask
    dark_ratio = np.sum(dark_mask) / subject_pixels

    # --- Signal 3: Brownish/roasted pixels (R high, G moderate, low B) ---
    # Cooked/roasted tomatoes often become brownish-orange rather than bright red
    brown_mask = (r > 100) & (g > 50) & (g < r * 0.75) & (b < 60) & subject_mask
    brown_ratio = np.sum(brown_mask) / subject_pixels

    # --- Signal 4: Stem/black spot detection (very dark brown patches near top) ---
    # Rotten stems appear as concentrated dark_brown clusters
    black_mask = (r < 50) & (g < 40) & (b < 40) & subject_mask
    black_ratio = np.sum(black_mask) / subject_pixels

    # --- Signal 5: Color uniformity — fresh tomatoes are more uniformly red ---
    # Low std dev in green channel within red pixels = more uniform (fresh)
    if np.sum(red_mask) > 10:
        g_std_in_red = np.std(g[red_mask])
    else:
        g_std_in_red = 0

    print(
        f"DEBUG Tomato: red={red_ratio:.3f}, dark={dark_ratio:.3f}, "
        f"brown={brown_ratio:.3f}, black={black_ratio:.3f}, g_std={g_std_in_red:.2f}",
        flush=True
    )

    # ===================== DECISION LOGIC =====================

    # Roasted/cooked: high dark AND high brown (shriveled) even if red exists
    if dark_ratio > 0.15 and brown_ratio > 0.25:
        return {
            "crop": "Tomato",
            "quality": "Bad",
            "confidence": 94,
            "advice": "Signs of cooking, roasting, or severe bruising detected. Not suitable for fresh sale."
        }

    # Heavy rot: large dark patches
    if dark_ratio > 0.25:
        return {
            "crop": "Tomato",
            "quality": "Bad",
            "confidence": 96,
            "advice": "Significant dark spots or rot detected. This tomato has deteriorated."
        }

    # Heavy black stem rot
    if black_ratio > 0.10:
        return {
            "crop": "Tomato",
            "quality": "Bad",
            "confidence": 92,
            "advice": "Black rot or stem damage detected. Not suitable for market."
        }

    # Under-ripe: very little red
    if red_ratio < 0.15:
        quality = "Moderate"
        confidence = 82
        advice = "The tomato appears under-ripe or lacks healthy red coloration."
        if dark_ratio > 0.15:
            quality = "Bad"
            confidence = 88
            advice = "Under-ripe with signs of rot. Poor quality detected."
        return {"crop": "Tomato", "quality": quality, "confidence": confidence, "advice": advice}

    # Moderately damaged
    if dark_ratio > 0.10 or (brown_ratio > 0.40 and red_ratio < 0.35):
        return {
            "crop": "Tomato",
            "quality": "Moderate",
            "confidence": 78,
            "advice": "Some bruising or discoloration detected. Check before selling."
        }

    # Fresh and healthy
    return {
        "crop": "Tomato",
        "quality": "Good",
        "confidence": 95 if red_ratio > 0.5 else 88,
        "advice": "Excellent color and texture! Your tomato looks fresh and ready for market."
    }


def analyze_root_vegetable(img_array, crop_type):
    """
    For onion/potato/garlic: checks for dark rot patches and overall color uniformity.
    """
    r = img_array[:, :, 0].astype(float)
    g = img_array[:, :, 1].astype(float)
    b = img_array[:, :, 2].astype(float)

    subject_mask = (r > 40) | (g > 40) | (b > 40)
    subject_pixels = np.sum(subject_mask)
    if subject_pixels == 0:
        subject_pixels = img_array.shape[0] * img_array.shape[1]
        subject_mask = np.ones_like(r, dtype=bool)

    # Dark rot/mold patches
    dark_mask = (r < 70) & (g < 60) & (b < 50) & subject_mask
    dark_ratio = np.sum(dark_mask) / subject_pixels

    # Greenish mold on onion
    green_mask = (g > r * 1.2) & (g > b * 1.2) & subject_mask
    green_ratio = np.sum(green_mask) / subject_pixels

    print(f"DEBUG {crop_type}: dark={dark_ratio:.3f}, green={green_ratio:.3f}", flush=True)

    if dark_ratio > 0.20 or green_ratio > 0.30:
        return {
            "crop": crop_type,
            "quality": "Bad",
            "confidence": 90,
            "advice": f"Dark spots or mold detected on {crop_type}. Not suitable for fresh market."
        }
    elif dark_ratio > 0.08:
        return {
            "crop": crop_type,
            "quality": "Moderate",
            "confidence": 75,
            "advice": f"Minor blemishes detected on {crop_type}. Inspect closely before selling."
        }
    return {
        "crop": crop_type,
        "quality": "Good",
        "confidence": 85,
        "advice": f"Your {crop_type} looks healthy and market-ready!"
    }


def analyze_brinjal(img_array):
    """
    Brinjal quality: should be dark purple. Brown/yellow = deterioration.
    """
    r = img_array[:, :, 0].astype(float)
    g = img_array[:, :, 1].astype(float)
    b = img_array[:, :, 2].astype(float)

    subject_mask = (r > 30) | (g > 30) | (b > 30)
    subject_pixels = np.sum(subject_mask)
    if subject_pixels == 0:
        subject_pixels = img_array.shape[0] * img_array.shape[1]
        subject_mask = np.ones_like(r, dtype=bool)

    # Brownish/yellowed = rot
    brown_mask = (r > 100) & (g > 60) & (g > b * 1.3) & subject_mask
    brown_ratio = np.sum(brown_mask) / subject_pixels

    # Dark purple = healthy brinjal
    purple_mask = (b > 60) & (r > 50) & (g < r * 0.8) & subject_mask
    purple_ratio = np.sum(purple_mask) / subject_pixels

    print(f"DEBUG Brinjal: brown={brown_ratio:.3f}, purple={purple_ratio:.3f}", flush=True)

    if brown_ratio > 0.30:
        return {
            "crop": "Brinjal",
            "quality": "Bad",
            "confidence": 88,
            "advice": "Browning or yellowing detected. Brinjal may be overripe or rotting."
        }
    elif purple_ratio > 0.25:
        return {
            "crop": "Brinjal",
            "quality": "Good",
            "confidence": 87,
            "advice": "Deep purple color detected — your brinjal looks fresh and healthy!"
        }
    return {
        "crop": "Brinjal",
        "quality": "Moderate",
        "confidence": 70,
        "advice": "Color appears inconsistent. Inspect for ripeness before selling."
    }


def analyze_leafy(img_array, crop_type):
    """
    Leafy vegetables: green ratio determines freshness. Yellow/brown = wilted.
    """
    r = img_array[:, :, 0].astype(float)
    g = img_array[:, :, 1].astype(float)
    b = img_array[:, :, 2].astype(float)

    subject_mask = (r > 30) | (g > 30) | (b > 30)
    subject_pixels = np.sum(subject_mask)
    if subject_pixels == 0:
        subject_pixels = img_array.shape[0] * img_array.shape[1]
        subject_mask = np.ones_like(r, dtype=bool)

    # Healthy green pixels
    green_mask = (g > r * 1.1) & (g > b * 1.1) & (g > 50) & subject_mask
    green_ratio = np.sum(green_mask) / subject_pixels

    # Yellowing/wilting
    yellow_mask = (r > 120) & (g > 100) & (b < 80) & subject_mask
    yellow_ratio = np.sum(yellow_mask) / subject_pixels

    print(f"DEBUG {crop_type}: green={green_ratio:.3f}, yellow={yellow_ratio:.3f}", flush=True)

    if yellow_ratio > 0.30 or green_ratio < 0.15:
        return {
            "crop": crop_type,
            "quality": "Bad",
            "confidence": 88,
            "advice": f"Yellowing or wilting detected in {crop_type}. Not suitable for fresh market."
        }
    elif green_ratio > 0.40:
        return {
            "crop": crop_type,
            "quality": "Good",
            "confidence": 90,
            "advice": f"Vibrant green color — your {crop_type} looks fresh and healthy!"
        }
    return {
        "crop": crop_type,
        "quality": "Moderate",
        "confidence": 72,
        "advice": f"{crop_type} shows some color loss. Sell quickly for best value."
    }


def analyze_general(img_array, crop_type):
    """
    General fallback: uses brightness, dark patches, and color variance.
    """
    r = img_array[:, :, 0].astype(float)
    g = img_array[:, :, 1].astype(float)
    b = img_array[:, :, 2].astype(float)

    subject_mask = (r > 30) | (g > 30) | (b > 30)
    subject_pixels = np.sum(subject_mask)
    if subject_pixels == 0:
        subject_pixels = img_array.shape[0] * img_array.shape[1]
        subject_mask = np.ones_like(r, dtype=bool)

    # Dark rot patches
    dark_mask = (r < 70) & (g < 60) & (b < 50) & subject_mask
    dark_ratio = np.sum(dark_mask) / subject_pixels

    # Overall brightness within subject
    brightness = (
        np.mean(r[subject_mask]) * 0.299 +
        np.mean(g[subject_mask]) * 0.587 +
        np.mean(b[subject_mask]) * 0.114
    )

    print(f"DEBUG General ({crop_type}): dark={dark_ratio:.3f}, brightness={brightness:.2f}", flush=True)

    if dark_ratio > 0.25 or brightness < 40:
        return {
            "crop": crop_type,
            "quality": "Bad",
            "confidence": 80,
            "advice": f"Signs of rot or significant discoloration detected in {crop_type}. Quality is poor."
        }
    elif dark_ratio > 0.10 or brightness < 70:
        return {
            "crop": crop_type,
            "quality": "Moderate",
            "confidence": 70,
            "advice": f"{crop_type} shows some wear. Inspect before selling."
        }
    return {
        "crop": crop_type,
        "quality": "Good",
        "confidence": 82,
        "advice": f"Your {crop_type} looks healthy and market-ready!"
    }
