import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "typetrend.db")

def get_db_connection():
    """Returns a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables for sessions and goals."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_number INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        wpm REAL NOT NULL,
        raw_wpm REAL NOT NULL,
        accuracy REAL NOT NULL,
        duration_seconds INTEGER NOT NULL,
        correct_chars INTEGER NOT NULL,
        incorrect_chars INTEGER NOT NULL,
        total_chars INTEGER NOT NULL,
        category TEXT DEFAULT 'general',
        passage_title TEXT,
        is_demo INTEGER DEFAULT 0
    )
    """)

    # Goals table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY DEFAULT 1,
        target_wpm REAL DEFAULT 60.0,
        target_accuracy REAL DEFAULT 95.0,
        daily_goal_minutes INTEGER DEFAULT 15,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Seed initial goals row if not present
    cursor.execute("SELECT id FROM goals WHERE id = 1")
    if cursor.fetchone() is None:
        cursor.execute("""
        INSERT INTO goals (id, target_wpm, target_accuracy, daily_goal_minutes)
        VALUES (1, 60.0, 95.0, 15)
        """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
