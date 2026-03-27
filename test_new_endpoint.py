import requests

# 1. Login to get token
login_data = {
    "username": "test@applicant.com",
    "password": "password"
}
# Assuming there is a test account or we might need to register first
register_data = {
    "email": "test@applicant.com",
    "password": "password",
    "role": "applicant"
}
try:
    requests.post("http://localhost:8000/auth/register", json=register_data)
except Exception:
    pass

r = requests.post("http://localhost:8000/auth/login", data=login_data)
if r.status_code == 200:
    token = r.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
         "monthly_income": 85000,
         "monthly_expenses": 35000,
         "loan_amount": 1500000,
         "loan_tenure_months": 60,
         "credit_score": 720,
         "existing_loans_count": 1,
         "total_existing_emi": 12000,
         "employment_type": "salaried",
         "employment_years": 5,
         "late_payment_history": 0,
         "loan_purpose": "Home Purchase",
         "property_type": "Urban"
    }

    resp = requests.post("http://localhost:8000/applications/new", json=payload, headers=headers)
    print("STATUS", resp.status_code)
    print(resp.json())
else:
    print("Login failed:", r.status_code, r.text)
