import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('backend/.env')
url = os.getenv('DATABASE_URL')

if not url:
    print("[Error] No DATABASE_URL found")
    exit(1)

# Fix for postgres:// vs postgresql://
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)

print(f"Direct connection to: {url[:30]}...")

try:
    conn = psycopg2.connect(url)
    cur = conn.cursor()
    cur.execute("SELECT email, role FROM users")
    users = cur.fetchall()
    print("\nUsers found:")
    for user in users:
        print(f" - {user[0]} [{user[1]}]")
    cur.close()
    conn.close()
    print("\nConnection successful!")
except Exception as e:
    print(f"\n[Error] {e}")
