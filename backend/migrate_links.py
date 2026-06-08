import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "database.db")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE news_articles ADD COLUMN linked_album_id INTEGER DEFAULT NULL")
    print("Added linked_album_id to news_articles")
except sqlite3.OperationalError as e:
    print(f"news_articles: {e}")

try:
    cursor.execute("ALTER TABLE gallery_albums ADD COLUMN linked_article_id INTEGER DEFAULT NULL")
    print("Added linked_article_id to gallery_albums")
except sqlite3.OperationalError as e:
    print(f"gallery_albums: {e}")

conn.commit()
conn.close()
print("Migration complete.")
