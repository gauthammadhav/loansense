import sqlite3

conn = sqlite3.connect('backend/loansense.db')
cur = conn.cursor()

print("=" * 60)
print("LOCAL SQLITE DATABASE CONTENTS")
print("=" * 60)

print("\n--- USERS ---")
cur.execute("SELECT id, email, full_name, role FROM users")
for r in cur.fetchall():
    print(f"  ID={r[0]} | {r[1]} | {r[2]} | {r[3]}")

print("\n--- LOAN APPLICATIONS (first 10 columns) ---")
cur.execute("SELECT id, applicant_id, status, ml_prediction, ml_confidence, loan_amount, applicant_income FROM loan_applications")
for r in cur.fetchall():
    print(f"  ID={r[0]} | user_id={r[1]} | status={r[2]} | ml={r[3]} conf={r[4]} | loan={r[5]} income={r[6]}")

print(f"\nTotal users: {cur.execute('SELECT count(*) FROM users').fetchone()[0]}")
print(f"Total applications: {cur.execute('SELECT count(*) FROM loan_applications').fetchone()[0]}")
conn.close()
