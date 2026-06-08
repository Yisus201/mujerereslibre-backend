import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "database.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE gallery_albums ADD COLUMN is_hidden BOOLEAN DEFAULT 0")
    print("Added is_hidden to gallery_albums")
except Exception as e:
    print(f"Skipped gallery_albums: {e}")

try:
    cursor.execute("ALTER TABLE news_articles ADD COLUMN is_hidden BOOLEAN DEFAULT 0")
    print("Added is_hidden to news_articles")
except Exception as e:
    print(f"Skipped news_articles: {e}")

conn.commit()
conn.close()
