import os
import sys

# Ensure backend modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.prediction_service import run_prediction_new

def test_income_sweep():
    # Base applicant profile that might be borderline
    base_data = {
        "monthly_income": 200000,
        "monthly_expenses": 50000,
        "loan_amount": 500000,
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

    print("Testing Monthly Income Sweep (100k to 500k):")
    print(f"{'Income (INR)':<15} | {'Prediction':<10} | {'Confidence':<15} | {'DTI':<10} | {'Disp. Inc.':<10}")
    print("-" * 75)

    for income in range(100000, 550000, 25000):
        test_data = base_data.copy()
        test_data["monthly_income"] = income
        
        res = run_prediction_new(test_data)
        
        pred = res["prediction"]
        conf = res["confidence"]
        dti = res["derived_features"]["debt_to_income"]
        disp = res["derived_features"]["disposable_income"]
        
        print(f"INR {income} | {pred} | {conf:.4f} | {dti:.3f} | INR {disp:.0f}")

if __name__ == "__main__":
    test_income_sweep()
