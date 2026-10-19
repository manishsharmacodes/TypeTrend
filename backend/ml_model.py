"""
TypeTrend Machine Learning Engine: Typing Speed Pattern Predictor.

Uses scikit-learn's LinearRegression to analyze the user's practice trajectory,
estimate future performance, compute trend slopes, and project milestones.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
from database import get_db_connection

MIN_SESSIONS_REQUIRED = 3

def get_session_history(include_demo=False):
    """Retrieves all chronologically ordered sessions from SQLite."""
    conn = get_db_connection()
    query = """
        SELECT id, session_number, timestamp, wpm, raw_wpm, accuracy, duration_seconds, is_demo
        FROM sessions
    """
    if not include_demo:
        query += " WHERE is_demo = 0"
    query += " ORDER BY id ASC"
    
    rows = conn.execute(query).fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def train_and_predict_wpm(include_demo=False):
    """
    Trains a Linear Regression model on historical sessions and predicts
    typing speed for the next practice session.
    """
    sessions = get_session_history(include_demo=include_demo)
    total_sessions = len(sessions)
    
    # Insufficient data handling (< 3 sessions)
    if total_sessions < MIN_SESSIONS_REQUIRED:
        latest_wpm = sessions[-1]["wpm"] if total_sessions > 0 else 0.0
        avg_wpm = round(np.mean([s["wpm"] for s in sessions]), 1) if total_sessions > 0 else 0.0
        
        return {
            "status": "insufficient_data",
            "is_ml_prediction": False,
            "min_sessions_required": MIN_SESSIONS_REQUIRED,
            "current_session_count": total_sessions,
            "sessions_needed": MIN_SESSIONS_REQUIRED - total_sessions,
            "latest_wpm": latest_wpm,
            "baseline_fallback": avg_wpm if avg_wpm > 0 else 40.0,
            "message": f"Complete {MIN_SESSIONS_REQUIRED - total_sessions} more typing session(s) to activate machine learning predictions. Currently using baseline statistical average.",
            "disclaimer": "This is a simple baseline average, not an ML prediction.",
            "history_summary": {
                "count": total_sessions,
                "latest_wpm": latest_wpm,
                "avg_wpm": avg_wpm
            }
        }
    
    # Prepare DataFrame
    df = pd.DataFrame(sessions)
    
    # Feature Engineering
    # 1. Continuous session index (1, 2, 3...)
    df["session_idx"] = np.arange(1, total_sessions + 1)
    
    # 2. Moving Average of last 3 sessions (captures recent momentum)
    df["moving_avg_3"] = df["wpm"].rolling(window=3, min_periods=1).mean()
    
    # 3. Accuracy trend (as decimal 0.0 - 1.0)
    df["acc_factor"] = df["accuracy"] / 100.0
    
    # 4. Normalized practice duration
    df["duration_norm"] = df["duration_seconds"] / 60.0
    
    # Features matrix X and Target vector y
    feature_cols = ["session_idx", "moving_avg_3", "acc_factor", "duration_norm"]
    X = df[feature_cols].values
    y = df["wpm"].values
    
    # Fit Linear Regression Model
    model = LinearRegression()
    model.fit(X, y)
    
    # Compute in-sample predictions and R² goodness of fit
    y_pred_history = model.predict(X)
    r2 = float(r2_score(y, y_pred_history)) if len(y) > 2 else 0.5
    r2 = max(0.0, min(1.0, r2)) # Clamp between 0 and 1
    
    # Construct next session features (Session N + 1)
    next_session_idx = total_sessions + 1
    # Moving average of the last 3 sessions
    recent_3_avg = float(df["wpm"].tail(3).mean())
    avg_accuracy = float(df["accuracy"].mean()) / 100.0
    typical_duration = float(df["duration_seconds"].median()) / 60.0
    
    X_next = np.array([[next_session_idx, recent_3_avg, avg_accuracy, typical_duration]])
    predicted_raw = float(model.predict(X_next)[0])
    
    # Apply safety bounds (realistic human typing constraints)
    latest_wpm = float(df["wpm"].iloc[-1])
    # A single session jump rarely exceeds +/- 25 WPM realistically
    predicted_wpm = round(max(5.0, min(250.0, predicted_raw)), 1)
    
    # Calculate key metrics
    difference = round(predicted_wpm - latest_wpm, 1)
    trend_slope = round(float(model.coef_[0]), 2)  # speed gain per session
    intercept = round(float(model.intercept_), 2)
    
    # Confidence estimation based on sample size and R²
    if total_sessions >= 10 and r2 >= 0.6:
        confidence = "High"
    elif total_sessions >= 5 and r2 >= 0.3:
        confidence = "Moderate"
    else:
        confidence = "Preliminary"
        
    # Projected milestones: estimated sessions to reach target WPMs
    milestones = []
    current_best = float(df["wpm"].max())
    target_tiers = [40, 50, 60, 70, 80, 100, 120]
    
    # Only calculate forward milestones if trend is positive
    for target in target_tiers:
        if target > latest_wpm:
            if trend_slope > 0.05:
                gap = target - latest_wpm
                estimated_sessions = int(np.ceil(gap / trend_slope))
                milestones.append({
                    "target_wpm": target,
                    "sessions_needed": estimated_sessions,
                    "achievable": True
                })
            else:
                milestones.append({
                    "target_wpm": target,
                    "sessions_needed": None,
                    "achievable": False,
                    "note": "Maintain consistent practice to establish an upward trajectory."
                })
        else:
            milestones.append({
                "target_wpm": target,
                "sessions_needed": 0,
                "achieved": True
            })
            
    # Chart series data: Actual points vs Fitted regression trend line
    chart_points = []
    for i in range(total_sessions):
        chart_points.append({
            "session_number": int(df["session_number"].iloc[i]),
            "timestamp": df["timestamp"].iloc[i],
            "actual_wpm": round(float(df["wpm"].iloc[i]), 1),
            "fitted_trend_wpm": round(float(y_pred_history[i]), 1),
            "accuracy": round(float(df["accuracy"].iloc[i]), 1)
        })
        
    # Add next projected point
    chart_points.append({
        "session_number": next_session_idx,
        "timestamp": "Projected Next Session",
        "actual_wpm": None,
        "fitted_trend_wpm": predicted_wpm,
        "is_projection": True
    })
    
    # Plain English explanation
    slope_desc = "improving" if trend_slope > 0 else "steady or consolidating"
    direction_word = "gain" if difference >= 0 else "decrease"
    explanation = (
        f"Based on your last {total_sessions} sessions, your typing speed is {slope_desc} at an estimated rate of "
        f"{abs(trend_slope)} WPM per session. The Linear Regression model predicts your next performance will be "
        f"approximately {predicted_wpm} WPM (a {abs(difference)} WPM {direction_word} compared to your latest session of {latest_wpm} WPM)."
    )
    
    return {
        "status": "success",
        "is_ml_prediction": True,
        "model_type": "Multiple Linear Regression",
        "features_used": [
            "Practice session index (progression sequence)",
            "3-session moving average WPM (recent momentum)",
            "Accuracy ratio (precision weighting)",
            "Normalized test duration (endurance factor)"
        ],
        "feature_weights": {
            "session_index_slope": trend_slope,
            "moving_avg_weight": round(float(model.coef_[1]), 2),
            "accuracy_weight": round(float(model.coef_[2]), 2),
            "duration_weight": round(float(model.coef_[3]), 2),
            "intercept": intercept
        },
        "total_sessions_analyzed": total_sessions,
        "latest_wpm": latest_wpm,
        "predicted_wpm": predicted_wpm,
        "difference": difference,
        "trend_direction": "up" if difference >= 0 else "down",
        "r2_score": round(r2, 3),
        "confidence": confidence,
        "explanation": explanation,
        "disclaimer": "Machine learning predictions are statistical approximations based on historical patterns and assuming consistent focus. Real performance can vary with physical fatigue, passage complexity, and keyboard familiarity.",
        "chart_points": chart_points,
        "milestones": milestones[:4] # Return next 4 relevant milestones
    }
