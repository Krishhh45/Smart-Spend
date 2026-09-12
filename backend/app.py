import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from services.supabase_client import supabase
from services.ml_engine import calculate_anomaly_score, predict_future_expense
from services.nlp_parser import parse_natural_transaction
from services.expense_planner_ai import optimize_expense_plan

load_dotenv()

app = Flask(__name__)
CORS(app)

# In-memory settings state for user session / testing fallback
CURRENT_USER_SETTINGS = {
    "theme_preference": "light",
    "language_preference": "en"
}

ALLOWED_THEMES = {"light", "dark"}
ALLOWED_LANGUAGES = {"en", "hi", "mr"}

@app.route("/api/v1/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "status": "healthy",
        "service": "SmartSpend Python Backend & AI Engine",
        "version": "1.0.0"
    })

@app.route("/api/v1/ai/parse-transaction", methods=["POST"])
def parse_transaction():
    """Parses natural language expense text / voice transcription into structured transaction proposal."""
    data = request.get_json() or {}
    text = data.get("text", "")
    default_lang = data.get("language", "en")
    
    if not text:
        return jsonify({
            "success": False,
            "error": "Missing 'text' field in request body"
        }), 400
        
    result = parse_natural_transaction(text, default_lang)
    return jsonify({
        "success": True,
        "data": result
    })

@app.route("/api/v1/ai/anomaly-check", methods=["POST"])
def check_anomaly():
    data = request.get_json() or {}
    amount = float(data.get("amount", 0))
    history = [float(x) for x in data.get("history", [])]

    result = calculate_anomaly_score(amount, history)
    return jsonify({
        "success": True,
        "data": result
    })

@app.route("/api/v1/ai/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}
    daily_expenses = [float(x) for x in data.get("daily_expenses", [])]
    days_in_month = int(data.get("days_in_month", 30))

    result = predict_future_expense(daily_expenses, days_in_month)
    return jsonify({
        "success": True,
        "data": result
    })

@app.route("/api/v1/ai/expense-planner", methods=["POST"])
def plan_expenses():
    """
    Intelligently analyzes and prioritizes monthly planned expenses across:
    necessity, urgency, deadline, financial impact, and postponability.
    Optimizes spending within available budget and preserves an emergency buffer.
    """
    data = request.get_json() or {}
    available_budget = float(data.get("available_budget", 0))
    planned_expenses = data.get("planned_expenses", [])
    financial_history = data.get("financial_history") or {}
    language = data.get("language", "en")

    if available_budget <= 0 and not planned_expenses:
        return jsonify({
            "success": False,
            "error": "Please provide a valid available_budget or at least one planned expense."
        }), 400

    plan_result = optimize_expense_plan(
        available_budget=available_budget,
        planned_expenses=planned_expenses,
        financial_history=financial_history,
        language=language
    )

    return jsonify({
        "success": True,
        "data": plan_result
    })

@app.route("/api/v1/user/settings", methods=["GET"])
@app.route("/api/v1/user/profile", methods=["GET"])
def get_user_settings():
    """Returns the user's theme and language preferences."""
    # Check if auth header provided
    auth_header = request.headers.get("Authorization")
    user_metadata = {}

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            user_res = supabase.auth.get_user(token)
            if user_res and user_res.user:
                user_metadata = user_res.user.user_metadata or {}
        except Exception as e:
            # Fallback to current settings if token validation fails
            pass

    theme = user_metadata.get("theme_preference", CURRENT_USER_SETTINGS["theme_preference"])
    language = user_metadata.get("language_preference", CURRENT_USER_SETTINGS["language_preference"])

    return jsonify({
        "success": True,
        "data": {
            "theme_preference": theme,
            "language_preference": language
        }
    })

@app.route("/api/v1/user/settings", methods=["PUT"])
def update_user_settings():
    """Updates the user's theme and language preferences with strict validation."""
    data = request.get_json() or {}
    
    theme = data.get("theme_preference")
    language = data.get("language_preference")

    if theme is not None:
        if theme not in ALLOWED_THEMES:
            return jsonify({
                "success": False,
                "error": f"Invalid theme_preference '{theme}'. Allowed values are: {sorted(list(ALLOWED_THEMES))}"
            }), 400
        CURRENT_USER_SETTINGS["theme_preference"] = theme

    if language is not None:
        if language not in ALLOWED_LANGUAGES:
            return jsonify({
                "success": False,
                "error": f"Invalid language_preference '{language}'. Allowed values are: {sorted(list(ALLOWED_LANGUAGES))}"
            }), 400
        CURRENT_USER_SETTINGS["language_preference"] = language

    # If Supabase user token provided, sync to Supabase user metadata
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            supabase.auth.set_session(token, "")
            updates = {}
            if theme: updates["theme_preference"] = theme
            if language: updates["language_preference"] = language
            supabase.auth.update_user({"data": updates})
        except Exception:
            pass

    return jsonify({
        "success": True,
        "message": "User settings updated successfully",
        "data": {
            "theme_preference": CURRENT_USER_SETTINGS["theme_preference"],
            "language_preference": CURRENT_USER_SETTINGS["language_preference"]
        }
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
