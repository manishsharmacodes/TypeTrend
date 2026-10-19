"""
Unit and Integration Test Suite for TypeTrend Backend.
Covers WPM calculation, accuracy calculation, API validation, and ML prediction behavior.
"""

import unittest
import json
from models import (
    calculate_wpm,
    calculate_raw_wpm,
    calculate_accuracy,
    validate_session_data,
    validate_goals_data
)
from app import app
from database import init_db, get_db_connection
from ml_model import train_and_predict_wpm

class TestTypeTrendCore(unittest.TestCase):
    
    def test_wpm_calculation_standard(self):
        """Test WPM using standard 5-character word convention."""
        # 300 correct characters in 60 seconds = 60 words = 60.0 WPM
        wpm = calculate_wpm(correct_chars=300, duration_seconds=60)
        self.assertEqual(wpm, 60.0)
        
        # 150 correct characters in 30 seconds = 30 words in 0.5 min = 60.0 WPM
        wpm_30s = calculate_wpm(correct_chars=150, duration_seconds=30)
        self.assertEqual(wpm_30s, 60.0)
        
        # 0 chars or 0 seconds
        self.assertEqual(calculate_wpm(0, 60), 0.0)
        self.assertEqual(calculate_wpm(300, 0), 0.0)

    def test_accuracy_calculation(self):
        """Test accuracy percentage and edge cases."""
        # 95 correct out of 100 total = 95.0%
        acc = calculate_accuracy(correct_chars=95, total_chars=100)
        self.assertEqual(acc, 95.0)
        
        # 0 total chars typed -> 100% safe fallback
        self.assertEqual(calculate_accuracy(0, 0), 100.0)
        
        # Perfect accuracy
        self.assertEqual(calculate_accuracy(250, 250), 100.0)
        
        # All errors
        self.assertEqual(calculate_accuracy(0, 50), 0.0)

    def test_session_validation(self):
        """Verify session data validator blocks invalid inputs."""
        valid, msg = validate_session_data({
            "duration_seconds": 60,
            "correct_chars": 200,
            "total_chars": 210
        })
        self.assertTrue(valid)
        self.assertEqual(msg, "")

        # Negative duration
        valid, msg = validate_session_data({
            "duration_seconds": -5,
            "correct_chars": 50,
            "total_chars": 50
        })
        self.assertFalse(valid)

        # Correct chars > total chars
        valid, msg = validate_session_data({
            "duration_seconds": 60,
            "correct_chars": 150,
            "total_chars": 100
        })
        self.assertFalse(valid)

    def test_goals_validation(self):
        """Verify goals validator allows sensible inputs and blocks absurd values."""
        valid, _ = validate_goals_data({"target_wpm": 75.0, "target_accuracy": 98.0})
        self.assertTrue(valid)

        # Unrealistic target WPM
        valid, msg = validate_goals_data({"target_wpm": 999.0})
        self.assertFalse(valid)

        # Accuracy below 50%
        valid, msg = validate_goals_data({"target_accuracy": 20.0})
        self.assertFalse(valid)


class TestTypeTrendAPI(unittest.TestCase):
    
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        init_db()

    def test_health_endpoint(self):
        """Verify health check returns healthy 200 status."""
        response = self.app.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "healthy")

    def test_passages_endpoint(self):
        """Verify passages returns list of curated passages."""
        response = self.app.get("/api/passages?category=general")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("passages", data)
        self.assertGreater(len(data["passages"]), 0)

    def test_save_session_and_retrieve(self):
        """Test POST /api/sessions and GET /api/sessions."""
        payload = {
            "duration_seconds": 60,
            "correct_chars": 250,
            "total_chars": 260,
            "category": "technology",
            "passage_title": "Test Passage"
        }
        res = self.app.post("/api/sessions", json=payload)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertIn("session", data)
        self.assertEqual(data["session"]["wpm"], 50.0)
        self.assertEqual(data["session"]["accuracy"], 96.2)

        # Retrieve sessions
        res2 = self.app.get("/api/sessions")
        self.assertEqual(res2.status_code, 200)
        sessions_data = json.loads(res2.data)
        self.assertGreaterEqual(sessions_data["count"], 1)

    def test_goals_api(self):
        """Test GET and PUT /api/goals."""
        put_res = self.app.put("/api/goals", json={
            "target_wpm": 70.0,
            "target_accuracy": 96.0,
            "daily_goal_minutes": 20
        })
        self.assertEqual(put_res.status_code, 200)
        data = json.loads(put_res.data)
        self.assertEqual(data["goals"]["target_wpm"], 70.0)

        get_res = self.app.get("/api/goals")
        self.assertEqual(get_res.status_code, 200)
        get_data = json.loads(get_res.data)
        self.assertEqual(get_data["target_wpm"], 70.0)

    def test_demo_data_and_ml_prediction(self):
        """Seed demo data and test genuine ML Linear Regression prediction."""
        demo_res = self.app.post("/api/demo-data")
        self.assertEqual(demo_res.status_code, 201)

        # Request prediction with demo data
        pred_res = self.app.get("/api/prediction?include_demo=true")
        self.assertEqual(pred_res.status_code, 200)
        pred_data = json.loads(pred_res.data)
        self.assertEqual(pred_data["status"], "success")
        self.assertTrue(pred_data["is_ml_prediction"])
        self.assertGreater(pred_data["predicted_wpm"], 0)
        self.assertIn("feature_weights", pred_data)
        self.assertIn("r2_score", pred_data)
        self.assertIn("chart_points", pred_data)
        self.assertIn("milestones", pred_data)

if __name__ == "__main__":
    unittest.main()
