import os
import sys

# Ensure backend modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.prediction_service import run_prediction_new

def test_sweep():
    base_data = {
        "monthly_income": 220000,
        "monthly_expenses": 50000,
        "loan_amount": 220000,
        "loan_tenure_months": 36,
        "credit_score": 680,
        "existing_loans_count": 0,
        "total_existing_emi": 0,
        "employment_type": "salaried",
        "employment_years": 5,
        "late_payment_history": 0,
        "loan_purpose": "General",
        "property_type": "Urban"
    }

    print("Testing Loan Amount Sweep (2L to 4L) at 2.2L Income:")
    print(f"{'Loan (INR)':<15} | {'Prediction':<10} | {'Confidence':<15} | {'DTI':<10} | {'Disp. Inc.':<10}")
    print("-" * 75)

    for loan in range(200000, 450000, 20000):
        test_data = base_data.copy()
        test_data["loan_amount"] = loan
        
        res = run_prediction_new(test_data)
        
        pred = res["prediction"]
        conf = res["confidence"]
        dti = res["derived_features"]["debt_to_income"]
        disp = res["derived_features"]["disposable_income"]
        
        print(f"INR {loan} | {pred} | {conf:.4f} | {dti:.3f} | INR {disp:.0f}")

if __name__ == "__main__":
    test_sweep()
