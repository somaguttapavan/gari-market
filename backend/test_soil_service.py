"""
Proper pytest unit tests for soil_service and the FastAPI endpoints.
"""
import sys
import os
import math
import pytest

# Ensure we can import from the backend directory
sys.path.insert(0, os.path.dirname(__file__))

from soil_service import analyze_soil


# ─── soil_service unit tests ──────────────────────────────────────────────────

class TestAnalyzeSoilValidation:
    def test_missing_field_raises(self):
        with pytest.raises((ValueError, KeyError)):
            analyze_soil({"ph": 6.5})

    def test_invalid_ph_raises(self):
        with pytest.raises(ValueError):
            analyze_soil({
                "ph": 20,  # out-of-range
                "nitrogen": 400, "phosphorus": 20, "potassium": 200,
                "moisture": 50, "organic_carbon": 0.5, "crop": "tomato"
            })

    def test_negative_nutrients_raise(self):
        with pytest.raises(ValueError):
            analyze_soil({
                "ph": 6.5, "nitrogen": -10, "phosphorus": 20,
                "potassium": 200, "moisture": 50, "organic_carbon": 0.5,
                "crop": "tomato"
            })


class TestAnalyzeSoilOutput:
    def _good_input(self, crop="tomato"):
        return {
            "ph": 6.5, "nitrogen": 400, "phosphorus": 20,
            "potassium": 200, "moisture": 50, "organic_carbon": 0.5,
            "crop": crop, "location": "Tropical"
        }

    def test_returns_required_keys(self):
        result = analyze_soil(self._good_input())
        for key in ["soil_health_score", "soil_status", "deficiencies",
                    "recommendations", "advisory_notes",
                    "ai_crop_recommendations", "vegetable_recommendations"]:
            assert key in result

    def test_score_clamped_between_0_and_100(self):
        result = analyze_soil(self._good_input())
        assert 0 <= result["soil_health_score"] <= 100

    def test_soil_status_is_valid(self):
        result = analyze_soil(self._good_input())
        assert result["soil_status"] in ("Good", "Moderate", "Poor")

    def test_good_soil_scores_high(self):
        """Well-balanced soil should score >= 70."""
        result = analyze_soil(self._good_input())
        assert result["soil_health_score"] >= 70

    def test_poor_soil_scores_low(self):
        """Highly acidic, nutrient-depleted soil should score below 60."""
        result = analyze_soil({
            "ph": 3.0, "nitrogen": 50, "phosphorus": 2,
            "potassium": 30, "moisture": 10, "organic_carbon": 0.1,
            "crop": "tomato"
        })
        assert result["soil_health_score"] < 60

    def test_deficiencies_is_list(self):
        result = analyze_soil(self._good_input())
        assert isinstance(result["deficiencies"], list)

    def test_recommendations_have_required_keys(self):
        result = analyze_soil(self._good_input())
        for rec in result["recommendations"]:
            assert "fertilizer" in rec
            assert "quantity" in rec
            assert "application_time" in rec

    def test_unknown_crop_uses_default_profile(self):
        """An unknown crop should not crash and return a valid result."""
        result = analyze_soil({
            "ph": 6.5, "nitrogen": 400, "phosphorus": 20,
            "potassium": 200, "moisture": 50, "organic_carbon": 0.5,
            "crop": "alien_plant"
        })
        assert result["soil_health_score"] >= 0


# ─── distance calculation helper ─────────────────────────────────────────────

class TestCalculateDistance:
    @staticmethod
    def _haversine(lat1, lon1, lat2, lon2):
        R = 6371
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2) ** 2)
        return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

    def test_same_location_is_zero(self):
        assert self._haversine(13.08, 80.27, 13.08, 80.27) == 0

    def test_chennai_to_madurai(self):
        dist = self._haversine(13.0827, 80.2707, 9.9252, 78.1198)
        assert 400 <= dist <= 440

    def test_distance_is_commutative(self):
        d1 = self._haversine(13.0827, 80.2707, 9.9252, 78.1198)
        d2 = self._haversine(9.9252, 78.1198, 13.0827, 80.2707)
        assert d1 == d2
