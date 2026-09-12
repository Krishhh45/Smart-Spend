import unittest
import json
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from services.nlp_parser import parse_natural_transaction

class TestSettingsAndNLP(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    # -------------------------------------------------------------
    # 1. SETTINGS API TESTS
    # -------------------------------------------------------------
    def test_get_settings_default(self):
        res = self.client.get("/api/v1/user/settings")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("theme_preference", data["data"])
        self.assertIn("language_preference", data["data"])

    def test_update_theme_preference_success(self):
        # Update to dark
        res = self.client.put("/api/v1/user/settings", json={"theme_preference": "dark"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["data"]["theme_preference"], "dark")

        # Update back to light
        res = self.client.put("/api/v1/user/settings", json={"theme_preference": "light"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["data"]["theme_preference"], "light")

    def test_update_theme_preference_invalid(self):
        res = self.client.put("/api/v1/user/settings", json={"theme_preference": "solarized"})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])
        self.assertIn("Invalid theme_preference", data["error"])

    def test_update_language_preference_success(self):
        for lang in ["en", "hi", "mr"]:
            res = self.client.put("/api/v1/user/settings", json={"language_preference": lang})
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data["data"]["language_preference"], lang)

    def test_update_language_preference_invalid(self):
        res = self.client.put("/api/v1/user/settings", json={"language_preference": "fr"})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])
        self.assertIn("Invalid language_preference", data["error"])

    # -------------------------------------------------------------
    # 2. NLP PARSER TESTS
    # -------------------------------------------------------------
    def test_nlp_english_chai(self):
        result = parse_natural_transaction("250 spend on chai")
        self.assertTrue(result["is_transaction"])
        self.assertEqual(result["amount"], 250.0)
        self.assertEqual(result["merchant"], "chai")
        self.assertEqual(result["category"], "Food & Dining")
        self.assertEqual(result["type"], "expense")
        self.assertEqual(result["language_detected"], "en")

    def test_nlp_hindi_chai(self):
        result = parse_natural_transaction("250 chai pe kharch kiye")
        self.assertTrue(result["is_transaction"])
        self.assertEqual(result["amount"], 250.0)
        self.assertEqual(result["merchant"], "chai")
        self.assertEqual(result["category"], "Food & Dining")
        self.assertEqual(result["type"], "expense")
        self.assertEqual(result["language_detected"], "hi")

    def test_nlp_marathi_chai(self):
        result = parse_natural_transaction("250 chai var kharch kela")
        self.assertTrue(result["is_transaction"])
        self.assertEqual(result["amount"], 250.0)
        self.assertEqual(result["merchant"], "chai")
        self.assertEqual(result["category"], "Food & Dining")
        self.assertEqual(result["type"], "expense")
        self.assertEqual(result["language_detected"], "mr")

    def test_nlp_marathi_chaha_devanagari(self):
        result = parse_natural_transaction("चहा वर २५० रुपये खर्च केले")
        self.assertTrue(result["is_transaction"])
        self.assertEqual(result["amount"], 250.0)
        self.assertEqual(result["merchant"], "chai")
        self.assertEqual(result["category"], "Food & Dining")
        self.assertEqual(result["type"], "expense")
        self.assertEqual(result["language_detected"], "mr")

    def test_nlp_hindi_chai_devanagari(self):
        result = parse_natural_transaction("चाय पर 250 रुपये खर्च किए")
        self.assertTrue(result["is_transaction"])
        self.assertEqual(result["amount"], 250.0)
        self.assertEqual(result["merchant"], "chai")
        self.assertEqual(result["category"], "Food & Dining")
        self.assertEqual(result["type"], "expense")
        self.assertEqual(result["language_detected"], "hi")

    def test_nlp_payment_mode_cash_and_upi(self):
        # Marathi / Hindi user case: 100 रुपीस चाय कॅश
        res_marathi_cash = parse_natural_transaction("100 रुपीस चाय कॅश")
        self.assertEqual(res_marathi_cash["amount"], 100.0)
        self.assertEqual(res_marathi_cash["merchant"], "chai")
        self.assertEqual(res_marathi_cash["payment_method"], "Cash")
        self.assertTrue(res_marathi_cash["payment_method_specified"])

        # Marathi: 100 चहा रोख दिली
        res_rokh = parse_natural_transaction("100 चहा रोख दिली")
        self.assertEqual(res_rokh["payment_method"], "Cash")
        self.assertTrue(res_rokh["payment_method_specified"])

        # Marathi user case: ₹200 च्या यूपीआय
        res_chya_upi = parse_natural_transaction("₹200 च्या यूपीआय")
        self.assertEqual(res_chya_upi["amount"], 200.0)
        self.assertEqual(res_chya_upi["merchant"], "chai")
        self.assertEqual(res_chya_upi["category"], "Food & Dining")
        self.assertEqual(res_chya_upi["payment_method"], "UPI")
        self.assertTrue(res_chya_upi["payment_method_specified"])

        # Marathi / UPI: 250 पेट्रोल गुगल पे
        res_gpay = parse_natural_transaction("250 पेट्रोल गुगल पे")
        self.assertEqual(res_gpay["payment_method"], "UPI")
        self.assertTrue(res_gpay["payment_method_specified"])

        res_cash = parse_natural_transaction("500 grocerry pe kharch cash se")
        self.assertEqual(res_cash["amount"], 500.0)
        self.assertEqual(res_cash["payment_method"], "Cash")
        self.assertTrue(res_cash["payment_method_specified"])

        res_upi = parse_natural_transaction("1200 bijli bill bhara UPI se")
        self.assertEqual(res_upi["amount"], 1200.0)
        self.assertEqual(res_upi["payment_method"], "UPI")
        self.assertTrue(res_upi["payment_method_specified"])

        res_none = parse_natural_transaction("250 chai pe kharch kiye")
        self.assertFalse(res_none["payment_method_specified"])
        self.assertIsNone(res_none["payment_method"])

    def test_nlp_marathi_battery_comma_and_english_translation(self):
        result = parse_natural_transaction("20,000 न्यू बॅटरी")
        self.assertTrue(result["is_transaction"])
        self.assertEqual(result["amount"], 20000.0)
        self.assertEqual(result["merchant"], "New Battery")
        self.assertEqual(result["category"], "Shopping")
        self.assertEqual(result["language_detected"], "mr")

    def test_nlp_command_phrases_any_language(self):
        # 1. English: "add 500 petrol upi"
        res_en = parse_natural_transaction("add 500 petrol upi", default_language="auto")
        self.assertTrue(res_en["is_transaction"])
        self.assertEqual(res_en["amount"], 500.0)
        self.assertEqual(res_en["merchant"], "Petrol")
        self.assertEqual(res_en["category"], "Fuel")
        self.assertEqual(res_en["payment_method"], "UPI")
        self.assertTrue(res_en["payment_method_specified"])

        # 2. Marathi command: "200 chaha cash add kar"
        res_mr = parse_natural_transaction("200 chaha cash add kar", default_language="auto")
        self.assertTrue(res_mr["is_transaction"])
        self.assertEqual(res_mr["amount"], 200.0)
        self.assertEqual(res_mr["merchant"], "chai")
        self.assertEqual(res_mr["category"], "Food & Dining")
        self.assertEqual(res_mr["payment_method"], "Cash")
        self.assertTrue(res_mr["payment_method_specified"])

        # 3. Marathi command Devanagari: "५० रुपये वडापाव कॅश टाका"
        res_vadapav = parse_natural_transaction("५० रुपये वडापाव कॅश टाका", default_language="auto")
        self.assertTrue(res_vadapav["is_transaction"])
        self.assertEqual(res_vadapav["amount"], 50.0)
        self.assertEqual(res_vadapav["merchant"], "Vada Pav")
        self.assertEqual(res_vadapav["category"], "Food & Dining")
        self.assertEqual(res_vadapav["payment_method"], "Cash")
        self.assertTrue(res_vadapav["payment_method_specified"])

        # 4. Hindi command: "500 rupaye petrol ka kharcha jodo"
        res_hi = parse_natural_transaction("500 rupaye petrol ka kharcha jodo upi se", default_language="auto")
        self.assertTrue(res_hi["is_transaction"])
        self.assertEqual(res_hi["amount"], 500.0)
        self.assertEqual(res_hi["merchant"], "Petrol")
        self.assertEqual(res_hi["payment_method"], "UPI")
        self.assertTrue(res_hi["payment_method_specified"])

        # 5. English command: "add transaction 150 chai cash"
        res_tx = parse_natural_transaction("add transaction 150 chai cash", default_language="auto")
        self.assertTrue(res_tx["is_transaction"])
        self.assertEqual(res_tx["amount"], 150.0)
        self.assertEqual(res_tx["merchant"], "chai")
        self.assertEqual(res_tx["payment_method"], "Cash")

    def test_api_parse_transaction_endpoint(self):
        res = self.client.post("/api/v1/ai/parse-transaction", json={"text": "250 chai pe kharch kiye"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["amount"], 250.0)
        self.assertEqual(data["data"]["merchant"], "chai")

    def test_marathi_grocery_merchant_autodetect(self):
        """Test: Marathi grocery items like कांद should auto-detect as English (Onion)."""
        # "150 रुपए कांद" -> amount=150, merchant="Onion", category="Groceries"
        res = parse_natural_transaction("150 रुपए कांद", default_language="auto")
        self.assertTrue(res["is_transaction"])
        self.assertEqual(res["amount"], 150.0)
        self.assertEqual(res["merchant"], "Onion")
        self.assertEqual(res["category"], "Groceries")

        # "50 rupae batata" -> amount=50, merchant="Potato"
        res2 = parse_natural_transaction("50 rupae batata", default_language="auto")
        self.assertTrue(res2["is_transaction"])
        self.assertEqual(res2["amount"], 50.0)
        self.assertEqual(res2["merchant"], "Potato")

        # "200 प्याज" -> amount=200, merchant="Onion" (Hindi)
        res3 = parse_natural_transaction("200 प्याज", default_language="auto")
        self.assertTrue(res3["is_transaction"])
        self.assertEqual(res3["amount"], 200.0)
        self.assertEqual(res3["merchant"], "Onion")

        # "30 रुपये दाल" -> amount=30, merchant="Dal / Lentils"
        res4 = parse_natural_transaction("30 रुपये दाल", default_language="auto")
        self.assertTrue(res4["is_transaction"])
        self.assertEqual(res4["amount"], 30.0)
        self.assertEqual(res4["merchant"], "Dal / Lentils")

if __name__ == "__main__":
    unittest.main()

