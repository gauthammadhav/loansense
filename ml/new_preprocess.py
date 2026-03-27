import pandas as pd

FEATURE_COLUMNS_NEW = [
  "monthly_income",
  "monthly_expenses", 
  "loan_amount",
  "loan_tenure_months",
  "credit_score",
  "existing_loans_count",
  "total_existing_emi",
  "employment_type",
  "employment_years",
  "late_payment_history",
  "new_emi",
  "debt_to_income",
  "disposable_income"
]

EMPLOYMENT_MAP = {
  "salaried": 0,
  "self-employed": 1, 
  "business": 2
}

def preprocess_new(data: dict) -> pd.DataFrame:
    """
    Takes a dict of raw input values.
    Returns a preprocessed single-row DataFrame
    ready for model prediction.
    Column order matches FEATURE_COLUMNS_NEW exactly.
    """
    df = pd.DataFrame([data])
    
    # Map employment_type using EMPLOYMENT_MAP
    # If unknown value -> default to 0 (salaried)
    if 'employment_type' in df.columns:
        df['employment_type'] = df['employment_type'].map(EMPLOYMENT_MAP).fillna(0)
    else:
        df['employment_type'] = 0

    # Ensure all columns are numeric, float. Handle NaN/None -> 0.0
    for col in FEATURE_COLUMNS_NEW:
        if col not in df.columns:
            df[col] = 0.0
        else:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0).astype(float)
            
    # Return DataFrame with columns in exact FEATURE_COLUMNS_NEW order
    return df[FEATURE_COLUMNS_NEW]

def compute_derived_features(data: dict) -> dict:
    """
    Auto-compute fields that can be derived
    from the core inputs the user provides.
    This reduces the form fields the applicant 
    needs to fill manually.
    """
    data_copy = data.copy()
    
    loan_amount = float(data_copy.get('loan_amount', 0))
    loan_tenure_months = float(data_copy.get('loan_tenure_months', 1))
    if loan_tenure_months <= 0:
        loan_tenure_months = 1  # safe div
        
    monthly_income = float(data_copy.get('monthly_income', 0))
    if monthly_income <= 0:
        monthly_income = 1
        
    monthly_expenses = float(data_copy.get('monthly_expenses', 0))
    total_existing_emi = float(data_copy.get('total_existing_emi', 0))
    
    new_emi = loan_amount / loan_tenure_months
    debt_to_income = (total_existing_emi + new_emi) / monthly_income
    disposable_income = monthly_income - monthly_expenses - total_existing_emi - new_emi
    
    data_copy['new_emi'] = new_emi
    data_copy['debt_to_income'] = debt_to_income
    data_copy['disposable_income'] = disposable_income
    
    return data_copy
