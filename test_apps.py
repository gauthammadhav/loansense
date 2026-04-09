import os
from dotenv import load_dotenv
import sqlalchemy as sa
import json

load_dotenv('backend/.env')
url = os.getenv('DATABASE_URL')
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)

try:
    engine = sa.create_engine(url)
    with engine.connect() as conn:
        q = sa.text("SELECT id, loan_amount, purpose, ml_prediction, ml_risk_band, status, submitted_at FROM loan_applications ORDER BY id DESC LIMIT 5")
        res = conn.execute(q).fetchall()
        for r in res:
            print(dict(r._mapping))
except Exception as e:
    print("Error:", e)
