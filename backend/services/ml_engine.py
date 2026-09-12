import numpy as np

def calculate_anomaly_score(amount: float, category_history: list[float]) -> dict:
    """
    Computes statistical Z-Score and IQR to flag spending anomalies.
    Returns whether the transaction is an anomaly, confidence, and reason.
    """
    if not category_history or len(category_history) < 2:
        return {"is_anomaly": False, "reason": None, "confidence": 0}

    arr = np.array(category_history)
    mean = np.mean(arr)
    std = np.std(arr)

    if std == 0:
        std = 1.0

    z_score = (amount - mean) / std

    if z_score > 2.0 or amount > (mean * 2.8):
        times = round(amount / mean, 1)
        return {
            "is_anomaly": True,
            "z_score": round(float(z_score), 2),
            "average": round(float(mean), 2),
            "reason": f"Transaction is {times}x higher than your historical category average of ₹{round(float(mean)):,}.",
            "confidence": min(98, round(70 + z_score * 8))
        }

    return {"is_anomaly": False, "reason": None, "confidence": 0}

def predict_future_expense(daily_expenses: list[float], days_in_month: int = 30) -> dict:
    """
    Projects month-end burn using current daily velocity and historical trends.
    """
    days_elapsed = len(daily_expenses)
    current_total = sum(daily_expenses)

    if days_elapsed == 0 or current_total == 0:
        return {
            "projected_total": 0,
            "daily_rate": 0,
            "confidence": "low"
        }

    daily_rate = current_total / days_elapsed
    projected_total = current_total + (daily_rate * (days_in_month - days_elapsed))

    return {
        "current_total": round(current_total, 2),
        "daily_rate": round(daily_rate, 2),
        "projected_total": round(projected_total, 2),
        "confidence": "high" if days_elapsed >= 10 else "medium"
    }
