import sqlite3
import os

DB_PATH = 'gestha.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS cattle (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            tag_id TEXT,
            birth_date TEXT,
            notes TEXT,
            ib_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cattle_id INTEGER NOT NULL,
            photo_path TEXT,
            result TEXT,
            confidence REAL,
            estimated_age_weeks INTEGER,
            predicted_birth_date TEXT,
            recommendation TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cattle_id) REFERENCES cattle(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cattle_id INTEGER NOT NULL,
            type TEXT,
            scheduled_at TIMESTAMP,
            sent_at TIMESTAMP,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (cattle_id) REFERENCES cattle(id)
        );
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database berhasil diinisialisasi!")

if __name__ == '__main__':
    init_db()