"""
Migrate users from local SQLite to live PostgreSQL.
Skips users that already exist in the target database.
"""
import sqlite3
import os
from dotenv import load_dotenv
import psycopg2

# Load the PostgreSQL URL from backend/.env
load_dotenv('backend/.env')
pg_url = os.getenv('DATABASE_URL')
if pg_url and pg_url.startswith("postgres://"):
    pg_url = pg_url.replace("postgres://", "postgresql://", 1)

# Connect to local SQLite
sqlite_conn = sqlite3.connect('backend/loansense.db')
sqlite_cur = sqlite_conn.cursor()

# Connect to live PostgreSQL
pg_conn = psycopg2.connect(pg_url)
pg_cur = pg_conn.cursor()

print("Migrating users from local SQLite -> live PostgreSQL...\n")

# Get all users from SQLite
sqlite_cur.execute("SELECT email, hashed_password, full_name, role, is_active FROM users")
local_users = sqlite_cur.fetchall()

migrated = 0
skipped = 0

for email, hashed_pw, full_name, role, is_active in local_users:
    # Check if user already exists in PostgreSQL
    pg_cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if pg_cur.fetchone():
        print(f"  [SKIP] {email} (already exists)")
        skipped += 1
        continue

    # Insert into PostgreSQL (cast is_active from int to bool for PG)
    pg_cur.execute(
        "INSERT INTO users (email, hashed_password, full_name, role, is_active) VALUES (%s, %s, %s, %s, %s)",
        (email, hashed_pw, full_name, role, bool(is_active))
    )
    print(f"  [MIGRATED] {email} ({full_name}) [{role}]")
    migrated += 1

pg_conn.commit()

print(f"\nDone! Migrated: {migrated}, Skipped: {skipped}")

# Show final state of live DB
pg_cur.execute("SELECT email, full_name, role FROM users")
print("\nCurrent users in LIVE database:")
for row in pg_cur.fetchall():
    print(f"  - {row[0]} ({row[1]}) [{row[2]}]")

pg_cur.close()
pg_conn.close()
sqlite_conn.close()
