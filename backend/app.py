import os
from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection, init_db
from models import (
    calculate_wpm,
    calculate_raw_wpm,
    calculate_accuracy,
    validate_session_data,
    validate_goals_data
)
from ml_model import train_and_predict_wpm
from passages import get_passages_by_category, PASSAGES

app = Flask(__name__)
# Enable CORS for React frontend (Vite runs on 5173 by default)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database tables exist at startup
init_db()

@app.route("/api/health", methods=["GET"])
def health_check():
    """Endpoint for verifying server status and database connectivity."""
    try:
        conn = get_db_connection()
        conn.execute("SELECT 1").fetchone()
        conn.close()
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "database": "connected",
            "version": "1.0.0"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route("/api/passages", methods=["GET"])
def get_passages():
    """Retrieve typing passages filtered by category."""
    category = request.args.get("category", "general")
    passages = get_passages_by_category(category)
    return jsonify({
        "category": category,
        "passages": passages
    }), 200

@app.route("/api/sessions", methods=["POST"])
def save_session():
    """
    Saves a completed typing session into SQLite.
    Validates payload and recomputes standard WPM & accuracy on the server
    to guarantee consistency and integrity.
    """
    data = request.get_json(silent=True) or {}
    is_valid, error_msg = validate_session_data(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    duration = round(float(data["duration_seconds"]), 1)
    correct_chars = int(data["correct_chars"])
    total_chars = int(data["total_chars"])
    incorrect_chars = int(data.get("incorrect_chars", total_chars - correct_chars))
    category = str(data.get("category", "general"))[:50]
    passage_title = str(data.get("passage_title", "Typing Practice"))[:100]
    is_demo = 1 if data.get("is_demo") else 0

    # Guarantee server-side computed standard metrics
    computed_wpm = calculate_wpm(correct_chars, duration)
    computed_raw_wpm = calculate_raw_wpm(total_chars, duration)
    computed_accuracy = calculate_accuracy(correct_chars, total_chars)

    conn = get_db_connection()
    cursor = conn.cursor()

    # Determine next session number for this user stream
    last_session = cursor.execute("""
        SELECT MAX(session_number) as max_num FROM sessions WHERE is_demo = ?
    """, (is_demo,)).fetchone()
    next_num = (last_session["max_num"] or 0) + 1

    cursor.execute("""
        INSERT INTO sessions (
            session_number, wpm, raw_wpm, accuracy, duration_seconds,
            correct_chars, incorrect_chars, total_chars, category,
            passage_title, is_demo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        next_num,
        computed_wpm,
        computed_raw_wpm,
        computed_accuracy,
        duration,
        correct_chars,
        incorrect_chars,
        total_chars,
        category,
        passage_title,
        is_demo
    ))
    
    session_id = cursor.lastrowid
    conn.commit()

    # Fetch inserted record
    saved_session = cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    conn.close()

    return jsonify({
        "message": "Typing session saved successfully",
        "session": dict(saved_session)
    }), 201

@app.route("/api/sessions", methods=["GET"])
def get_sessions():
    """Retrieves session history with optional category filtering and pagination."""
    limit = request.args.get("limit", default=100, type=int)
    category = request.args.get("category", default=None, type=str)
    include_demo = request.args.get("include_demo", default="false").lower() == "true"

    conn = get_db_connection()
    query = "SELECT * FROM sessions WHERE 1=1"
    params = []

    if not include_demo:
        query += " AND is_demo = 0"
    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    query += " ORDER BY id DESC LIMIT ?"
    params.append(min(limit, 500))

    rows = conn.execute(query, params).fetchall()
    conn.close()

    sessions = [dict(row) for row in rows]
    return jsonify({
        "count": len(sessions),
        "sessions": sessions
    }), 200

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    """
    Calculates summary metrics from actual database records:
    - Total sessions
    - Latest WPM
    - Best WPM achieved
    - Average accuracy
    - Predicted next-session WPM
    - Progress vs previous session
    - Weekly practice activity breakdown
    - Recent sessions
    """
    include_demo = request.args.get("include_demo", default="false").lower() == "true"
    
    conn = get_db_connection()
    demo_filter = "" if include_demo else "WHERE is_demo = 0"

    # Aggregates
    summary = conn.execute(f"""
        SELECT 
            COUNT(*) as total_sessions,
            MAX(wpm) as best_wpm,
            AVG(wpm) as avg_wpm,
            AVG(accuracy) as avg_accuracy,
            SUM(duration_seconds) as total_duration_seconds,
            SUM(total_chars) as total_chars_typed
        FROM sessions {demo_filter}
    """).fetchone()

    # Chronologically ordered recent sessions
    recent_rows = conn.execute(f"""
        SELECT * FROM sessions {demo_filter} ORDER BY id DESC LIMIT 10
    """).fetchall()

    # Progress compared with previous session
    latest_wpm = 0.0
    previous_wpm = 0.0
    progress_delta = 0.0

    if len(recent_rows) >= 1:
        latest_wpm = float(recent_rows[0]["wpm"])
    if len(recent_rows) >= 2:
        previous_wpm = float(recent_rows[1]["wpm"])
        progress_delta = round(latest_wpm - previous_wpm, 1)

    # Weekly activity (sessions in the last 7 days)
    today = datetime.now(timezone.utc).date()
    days = [(today - timedelta(days=i)).isoformat() for i in range(6, -1, -1)]
    weekly_activity = {day: 0 for day in days}

    activity_rows = conn.execute(f"""
        SELECT DATE(timestamp) as practice_date, COUNT(*) as session_count
        FROM sessions {demo_filter}
        WHERE DATE(timestamp) >= DATE('now', '-7 days')
        GROUP BY DATE(timestamp)
    """).fetchall()

    for row in activity_rows:
        d = row["practice_date"]
        if d in weekly_activity:
            weekly_activity[d] = row["session_count"]

    conn.close()

    # ML prediction snapshot
    ml_result = train_and_predict_wpm(include_demo=include_demo)
    predicted_wpm = ml_result.get("predicted_wpm") or ml_result.get("baseline_fallback")

    total_sessions = summary["total_sessions"] or 0
    best_wpm = round(summary["best_wpm"], 1) if summary["best_wpm"] is not None else 0.0
    avg_accuracy = round(summary["avg_accuracy"], 1) if summary["avg_accuracy"] is not None else 0.0
    avg_wpm = round(summary["avg_wpm"], 1) if summary["avg_wpm"] is not None else 0.0

    return jsonify({
        "metrics": {
            "total_sessions": total_sessions,
            "latest_wpm": latest_wpm,
            "previous_wpm": previous_wpm,
            "progress_delta": progress_delta,
            "best_wpm": best_wpm,
            "avg_wpm": avg_wpm,
            "avg_accuracy": avg_accuracy,
            "predicted_next_wpm": predicted_wpm,
            "is_ml_prediction": ml_result.get("is_ml_prediction", False),
            "total_practice_minutes": round((summary["total_duration_seconds"] or 0) / 60.0, 1),
            "total_chars_typed": summary["total_chars_typed"] or 0
        },
        "weekly_activity": [{"date": d, "count": weekly_activity[d]} for d in days],
        "recent_sessions": [dict(r) for r in recent_rows],
        "ml_snapshot": {
            "status": ml_result.get("status"),
            "confidence": ml_result.get("confidence", "N/A"),
            "trend_direction": ml_result.get("trend_direction", "flat"),
            "explanation": ml_result.get("explanation", ml_result.get("message", ""))
        }
    }), 200

@app.route("/api/prediction", methods=["GET"])
def get_prediction():
    """
    Dedicated endpoint for the ML typing speed prediction model.
    Runs scikit-learn Linear Regression on actual session history.
    """
    include_demo = request.args.get("include_demo", default="false").lower() == "true"
    result = train_and_predict_wpm(include_demo=include_demo)
    return jsonify(result), 200

@app.route("/api/goals", methods=["GET"])
def get_goals():
    """Retrieves user's target typing goals."""
    conn = get_db_connection()
    goal_row = conn.execute("SELECT * FROM goals WHERE id = 1").fetchone()
    conn.close()

    if not goal_row:
        return jsonify({
            "target_wpm": 60.0,
            "target_accuracy": 95.0,
            "daily_goal_minutes": 15
        }), 200

    return jsonify(dict(goal_row)), 200

@app.route("/api/goals", methods=["PUT"])
def update_goals():
    """Updates user's target typing goals with validation."""
    data = request.get_json(silent=True) or {}
    is_valid, error_msg = validate_goals_data(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    target_wpm = data.get("target_wpm", 60.0)
    target_accuracy = data.get("target_accuracy", 95.0)
    daily_goal_minutes = data.get("daily_goal_minutes", 15)

    cursor.execute("""
        UPDATE goals
        SET target_wpm = ?, target_accuracy = ?, daily_goal_minutes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
    """, (target_wpm, target_accuracy, daily_goal_minutes))
    conn.commit()

    updated = cursor.execute("SELECT * FROM goals WHERE id = 1").fetchone()
    conn.close()

    return jsonify({
        "message": "Goals updated successfully",
        "goals": dict(updated)
    }), 200

@app.route("/api/demo-data", methods=["POST"])
def seed_demo_data():
    """
    Seeds a realistic, clearly-labeled sample practice history (is_demo=1)
    so users and evaluators can test ML predictions, trend lines, and charts immediately.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear prior demo entries
    cursor.execute("DELETE FROM sessions WHERE is_demo = 1")

    # Realistic progression curve over 10 practice sessions
    demo_sessions = [
        {"wpm": 34.2, "raw_wpm": 37.0, "accuracy": 91.5, "dur": 60, "correct": 171, "inc": 14, "cat": "beginner", "title": "Home Row Foundation"},
        {"wpm": 37.5, "raw_wpm": 41.0, "accuracy": 92.0, "dur": 60, "correct": 188, "inc": 17, "cat": "beginner", "title": "Steady Rhythm"},
        {"wpm": 36.8, "raw_wpm": 39.5, "accuracy": 93.2, "dur": 60, "correct": 184, "inc": 13, "cat": "general", "title": "The Art of Mastery"},
        {"wpm": 41.0, "raw_wpm": 44.2, "accuracy": 93.8, "dur": 60, "correct": 205, "inc": 16, "cat": "general", "title": "Quiet Mornings"},
        {"wpm": 43.4, "raw_wpm": 46.0, "accuracy": 94.5, "dur": 60, "correct": 217, "inc": 13, "cat": "technology", "title": "The Evolution of Computing"},
        {"wpm": 46.2, "raw_wpm": 48.5, "accuracy": 95.1, "dur": 60, "correct": 231, "inc": 12, "cat": "technology", "title": "Responsive Web Ecosystems"},
        {"wpm": 45.0, "raw_wpm": 48.0, "accuracy": 94.0, "dur": 60, "correct": 225, "inc": 15, "cat": "programming", "title": "Writing Clean Code"},
        {"wpm": 49.6, "raw_wpm": 52.0, "accuracy": 95.8, "dur": 60, "correct": 248, "inc": 12, "cat": "programming", "title": "Asynchronous JavaScript"},
        {"wpm": 52.4, "raw_wpm": 54.8, "accuracy": 96.2, "dur": 60, "correct": 262, "inc": 10, "cat": "general", "title": "The Power of Curiosity"},
        {"wpm": 55.1, "raw_wpm": 57.2, "accuracy": 96.8, "dur": 60, "correct": 275, "inc": 9, "cat": "technology", "title": "Artificial Intelligence and Ethics"}
    ]

    for idx, s in enumerate(demo_sessions, start=1):
        tot = s["correct"] + s["inc"]
        cursor.execute("""
            INSERT INTO sessions (
                session_number, wpm, raw_wpm, accuracy, duration_seconds,
                correct_chars, incorrect_chars, total_chars, category,
                passage_title, is_demo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            idx, s["wpm"], s["raw_wpm"], s["accuracy"], s["dur"],
            s["correct"], s["inc"], tot, s["cat"], s["title"]
        ))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Demo practice sessions loaded successfully. All records are clearly tagged with is_demo=1.",
        "count": len(demo_sessions)
    }), 201

@app.route("/api/clear-data", methods=["POST"])
def clear_data():
    """Allows clearing all sessions or only demo sessions."""
    data = request.get_json(silent=True) or {}
    only_demo = data.get("only_demo", False)

    conn = get_db_connection()
    cursor = conn.cursor()

    if only_demo:
        cursor.execute("DELETE FROM sessions WHERE is_demo = 1")
        msg = "Demo practice sessions cleared successfully."
    else:
        cursor.execute("DELETE FROM sessions")
        msg = "All practice sessions cleared successfully."

    conn.commit()
    conn.close()

    return jsonify({"message": msg}), 200

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    print(f"TypeTrend Backend starting on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
