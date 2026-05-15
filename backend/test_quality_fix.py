"""
Quick test to verify the roasted tomato fix.
We simulate a roasted tomato image (dark + brownish-red pixels).
"""
import numpy as np
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from quality_service import analyze_tomato

def simulate_roasted_tomato():
    """Creates a pixel array that looks like roasted tomatoes:
    - Mix of dark patches (steam/char marks)  
    - Brownish-red tones (cooked color)
    - Some shiny spots (oil/liquid)
    """
    img = np.zeros((300, 300, 3), dtype=np.uint8)

    # Brownish-red base (cooked tomato color: R=170, G=70, B=30)
    img[:, :, 0] = 170  # R
    img[:, :, 1] = 70   # G
    img[:, :, 2] = 30   # B

    # Dark patches (char/stem marks) — 20% of image
    img[50:120, 50:150, :] = [40, 30, 20]   # dark brown patch
    img[200:260, 100:200, :] = [35, 25, 15]  # another dark patch

    result = analyze_tomato(img)
    print(f"\n=== ROASTED TOMATO TEST ===")
    print(f"Quality: {result['quality']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Advice: {result['advice']}")
    assert result['quality'] in ['Bad', 'Moderate'], f"FAIL: Expected Bad/Moderate, got {result['quality']}"
    print("✅ PASS: Roasted tomato correctly detected as bad quality\n")


def simulate_fresh_tomato():
    """Creates a pixel array that looks like a fresh red tomato."""
    img = np.zeros((300, 300, 3), dtype=np.uint8)

    # Bright red base (fresh tomato: R=200, G=50, B=40)
    img[:, :, 0] = 200  # R
    img[:, :, 1] = 50   # G
    img[:, :, 2] = 40   # B

    # Small dark stems area only (5%)
    img[0:15, 130:170, :] = [30, 60, 20]   # green stem

    result = analyze_tomato(img)
    print(f"=== FRESH TOMATO TEST ===")
    print(f"Quality: {result['quality']}")
    print(f"Confidence: {result['confidence']}%")
    print(f"Advice: {result['advice']}")
    assert result['quality'] == 'Good', f"FAIL: Expected Good, got {result['quality']}"
    print("✅ PASS: Fresh tomato correctly detected as good quality\n")


if __name__ == "__main__":
    simulate_fresh_tomato()
    simulate_roasted_tomato()
    print("All quality checks PASSED!")
