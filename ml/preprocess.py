import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

# Fixed column order for both training and inference
FEATURE_COLUMNS = [
    'gender', 
    'married', 
    'dependents', 
    'education', 
    'self_employed',
    'applicant_income', 
    'coapplicant_income', 
    'loan_amount', 
    'loan_amount_term',
    'credit_score', 
    'property_type', 
    'total_income', 
    'emi_estimate',
    'debt_to_income', 
    'income_to_loan', 
    'credit_score_band'
]

def preprocess(df):
    """
    Preprocesses the loan dataset by handling missing values, encoding categoricals,
    and adding engineered features. Identical logic is used for training and inference.
    
    Args:
        df (pd.DataFrame): Input dataframe containing raw feature columns.
        
    Returns:
        tuple: (X, y) where X is the preprocessed feature matrix and y is the target 
               (None if 'loan_status' is not present in input).
    """
    df = df.copy()
    
    # 0. Standardization of column names (Handles Kaggle format if necessary)
    rename_map = {
        'Gender': 'gender',
        'Married': 'married',
        'Dependents': 'dependents',
        'Education': 'education',
        'Self_Employed': 'self_employed',
        'ApplicantIncome': 'applicant_income',
        'CoapplicantIncome': 'coapplicant_income',
        'LoanAmount': 'loan_amount',
        'Loan_Amount_Term': 'loan_amount_term',
        'Credit_History': 'credit_score',
        'Property_Area': 'property_type',
        'Loan_Status': 'loan_status'
    }
    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})

    # If input is raw Kaggle Credit_History (0 or 1), upscale to score range (300-900)
    if 'credit_score' in df.columns:
        if df['credit_score'].max() <= 1:
            df['credit_score'] = df['credit_score'].map({1.0: 750, 0.0: 450, 1: 750, 0: 450}).fillna(600)

    # 1. Handle Missing Values
    # Categorical
    df['gender'] = df['gender'].fillna('Male')
    df['married'] = df['married'].fillna('No')
    df['dependents'] = df['dependents'].fillna('0')
    df['education'] = df['education'].fillna('Graduate')
    df['self_employed'] = df['self_employed'].fillna('No')
    df['property_type'] = df['property_type'].fillna('Semiurban')
    
    # Numeric
    df['applicant_income'] = pd.to_numeric(df['applicant_income'], errors='coerce').fillna(0)
    df['coapplicant_income'] = pd.to_numeric(df['coapplicant_income'], errors='coerce').fillna(0)
    df['loan_amount'] = pd.to_numeric(df['loan_amount'], errors='coerce').fillna(df['loan_amount'].median() if not df['loan_amount'].empty else 0)
    df['loan_amount_term'] = pd.to_numeric(df['loan_amount_term'], errors='coerce').fillna(360)
    df['credit_score'] = pd.to_numeric(df['credit_score'], errors='coerce').fillna(600)

    # Scale Normalization (Inference Only)
    # The frontend sends Annual Income and Full Dollar Loan amounts. The ML expects Monthly & Thousands.
    is_inference = 'loan_status' not in df.columns
    if is_inference:
        df['applicant_income'] = df['applicant_income'].apply(lambda x: x / 12 if x > 20000 else x)
        df['coapplicant_income'] = df['coapplicant_income'].apply(lambda x: x / 12 if x > 20000 else x)
        df['loan_amount'] = df['loan_amount'].apply(lambda x: x / 1000 if x > 1000 else x)

    # 2. Categorical Encoding (including Ordinal and Binary requirements)
    
    # Dependents: Ordinal (0, 1, 2, 3+ -> 0, 1, 2, 3)
    df['dependents'] = df['dependents'].astype(str).str.replace('+', '', regex=False).astype(int).clip(0, 3)
    
    # Education: Binary (Graduate=1, Not Graduate=0)
    df['education'] = df['education'].map({'Graduate': 1, 'Not Graduate': 0}).fillna(0).astype(int)
    
    # Property Type: Ordinal (Urban=2, Semiurban=1, Rural=0)
    df['property_type'] = df['property_type'].map({'Urban': 2, 'Semiurban': 1, 'Rural': 0}).fillna(0).astype(int)
    
    # Label Encoding for Gender, Married, Self_Employed
    le = LabelEncoder()
    
    # gender (Male/Female/Other)
    le.fit(['Female', 'Male', 'Other'])
    df['gender'] = le.transform(df['gender'].astype(str))
    
    # married (Yes/No) - Handle booleans from API
    df['married'] = df['married'].map({True: 'Yes', False: 'No', 'True': 'Yes', 'False': 'No', 'Yes': 'Yes', 'No': 'No'}).fillna('No')
    le.fit(['No', 'Yes'])
    df['married'] = le.transform(df['married'].astype(str))
    
    # self_employed (Yes/No) - Handle booleans from API
    df['self_employed'] = df['self_employed'].map({True: 'Yes', False: 'No', 'True': 'Yes', 'False': 'No', 'Yes': 'Yes', 'No': 'No'}).fillna('No')
    le.fit(['No', 'Yes'])
    df['self_employed'] = le.transform(df['self_employed'].astype(str))


    # 3. Engineered Features (Section 4.1.2)
    
    # total_income = applicant_income + coapplicant_income
    df['total_income'] = df['applicant_income'] + df['coapplicant_income']
    
    # emi_estimate = loan_amount / loan_amount_term
    df['emi_estimate'] = df['loan_amount'] / df['loan_amount_term'].replace(0, 360)
    
    # debt_to_income = emi_estimate / total_income
    df['debt_to_income'] = df['emi_estimate'] / df['total_income'].replace(0, 1)
    
    # income_to_loan = total_income / (loan_amount + 1)
    df['income_to_loan'] = df['total_income'] / (df['loan_amount'] + 1)
    
    # credit_score_band (300-499=0, 500-649=1, 650-749=2, 750+=3)
    df['credit_score_band'] = pd.cut(
        df['credit_score'], 
        bins=[0, 500, 650, 750, np.inf], 
        labels=[0, 1, 2, 3], 
        right=False
    ).astype(int)

    # 4. Target Label Handling
    y = None
    if 'loan_status' in df.columns:
        # Convert Y/N to 1/0
        y = df['loan_status'].map({'Y': 1, 'N': 0, 1: 1, 0: 0}).fillna(0).astype(int)

    # Return only features in the fixed order
    X = df[FEATURE_COLUMNS]
    
    return X, y
