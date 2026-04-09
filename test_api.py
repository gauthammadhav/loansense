import os
import urllib.request
import urllib.error
import urllib.parse
import json
from dotenv import load_dotenv
import sqlalchemy as sa
from jose import jwt
from datetime import datetime, timedelta

load_dotenv('backend/.env')

# Generate token for user 7 directly without hitting the password endpoint
# using the exact same logic as backend/services/auth_service.py
SECRET_KEY = os.getenv("SECRET_KEY", "loansense-dev-secret-key-change-in-production")
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

token = create_access_token({"sub": "7", "role": "applicant"})

print("Token created:", token)

# Now hit the live API
req = urllib.request.Request(
    'https://loansense-production.up.railway.app/applications/',
    headers={'Authorization': f'Bearer {token}'}
)

try:
    with urllib.request.urlopen(req) as response:
        print("Status code:", response.getcode())
        data = json.loads(response.read().decode())
        print("Data length:", len(data))
        if data:
            print("First item:", data[0])
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print(e.read().decode())
except Exception as e:
    print("Error:", e)
