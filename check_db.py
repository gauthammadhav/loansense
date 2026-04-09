import os
from dotenv import load_dotenv
import sqlalchemy as sa

# Load from backend/.env specifically
load_dotenv('backend/.env')
url = os.getenv('DATABASE_URL')

if not url:
    print("[Error] No DATABASE_URL found in backend/.env")
    exit(1)

print(f"Connecting to database (starts with {url[:20]}...)")

try:
    # SQLAlchemy requires 'postgresql://' not 'postgres://'
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
        
    engine = sa.create_engine(url)
    with engine.connect() as conn:
        # Check for user accounts
        query = sa.text("SELECT email, full_name, role FROM users")
        res = conn.execute(query).fetchall()
        
        print("\n[Users found in Database]:")
        if not res:
            print("  (Empty - No users found)")
        for row in res:
            print(f"  - {row.email} ({row.full_name}) [{row.role}]")
        
        # Check for applications
        count_query = sa.text("SELECT count(*) FROM loan_applications")
        count = conn.execute(count_query).scalar()
        print(f"\n[Total Loan Applications]: {count}")
        
        recent_query = sa.text("SELECT id, applicant_id, status, loan_amount FROM loan_applications ORDER BY id DESC LIMIT 5")
        recent = conn.execute(recent_query).fetchall()
        print("\n[Latest 5 Applications]:")
        for row in recent:
            print(f"  App ID={row.id} | User ID={row.applicant_id} | Status={row.status} | Amount={row.loan_amount}")
        
    print("\nDatabase check complete!")
except Exception as e:
    print(f"\n[Error] Connecting to database: {e}")
