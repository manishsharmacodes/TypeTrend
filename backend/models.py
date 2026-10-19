"""
TypeTrend Data Models and Calculation Utilities.

Standards:
- 1 standard word = 5 keystrokes/characters (including spaces and punctuation).
- Net WPM = (correct_characters / 5.0) / (duration_in_seconds / 60.0)
- Raw WPM = (total_characters_typed / 5.0) / (duration_in_seconds / 60.0)
- Accuracy (%) = (correct_characters / total_characters_typed) * 100
"""

def calculate_wpm(correct_chars: int, duration_seconds: float) -> float:
    """Calculates Net Words Per Minute using standard 5-character word convention."""
    if duration_seconds <= 0:
        return 0.0
    minutes = float(duration_seconds) / 60.0
    words = correct_chars / 5.0
    return round(max(0.0, words / minutes), 1)

def calculate_raw_wpm(total_chars: int, duration_seconds: float) -> float:
    """Calculates Gross/Raw Words Per Minute regardless of mistakes."""
    if duration_seconds <= 0:
        return 0.0
    minutes = float(duration_seconds) / 60.0
    words = total_chars / 5.0
    return round(max(0.0, words / minutes), 1)

def calculate_accuracy(correct_chars: int, total_chars: int) -> float:
    """Calculates typing accuracy percentage. Handles 0 characters safely."""
    if total_chars <= 0:
        return 100.0
    ratio = (correct_chars / total_chars) * 100.0
    return round(min(100.0, max(0.0, ratio)), 1)

def validate_session_data(data: dict) -> tuple[bool, str]:
    """Validates incoming session payload from the frontend."""
    if not isinstance(data, dict):
        return False, "Payload must be a JSON object"
    
    required_fields = ["duration_seconds", "correct_chars", "total_chars"]
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
        if not isinstance(data[field], (int, float)) or data[field] < 0:
            return False, f"Field '{field}' must be a non-negative number"
    
    if data["duration_seconds"] <= 0:
        return False, "duration_seconds must be greater than 0"
    
    if data["correct_chars"] > data["total_chars"]:
        return False, "correct_chars cannot exceed total_chars"
    
    return True, ""

def validate_goals_data(data: dict) -> tuple[bool, str]:
    """Validates user goals update payload."""
    if not isinstance(data, dict):
        return False, "Payload must be a JSON object"
    
    if "target_wpm" in data:
        wpm = data["target_wpm"]
        if not isinstance(wpm, (int, float)) or wpm < 10 or wpm > 300:
            return False, "target_wpm must be a realistic number between 10 and 300"
            
    if "target_accuracy" in data:
        acc = data["target_accuracy"]
        if not isinstance(acc, (int, float)) or acc < 50 or acc > 100:
            return False, "target_accuracy must be a percentage between 50 and 100"
            
    if "daily_goal_minutes" in data:
        mins = data["daily_goal_minutes"]
        if not isinstance(mins, int) or mins < 1 or mins > 240:
            return False, "daily_goal_minutes must be an integer between 1 and 240"
            
    return True, ""
