import pandas as pd
import sys
import os

# Add ml directory to path
sys.path.append(r'c:\Users\gauth\Desktop\Projects\MiniProject_F\loansense')

from ml.preprocess import preprocess

# Create a sample dataframe based on the Kaggle format
data = {
    'Gender': ['Male', 'Female', None],
    'Married': ['Yes', 'No', 'Yes'],
    'Dependents': ['0', '1', '3+'],
    'Education': ['Graduate', 'Not Graduate', 'Graduate'],
    'Self_Employed': ['No', 'Yes', None],
    'ApplicantIncome': [5000, 3000, 4000],
    'CoapplicantIncome': [0, 1500, 500],
    'LoanAmount': [100, 150, 200],
    'Loan_Amount_Term': [360, 180, 360],
    'Credit_History': [1, 0, None],
    'Property_Area': ['Urban', 'Rural', 'Semiurban'],
    'Loan_Status': ['Y', 'N', 'Y']
}

df = pd.DataFrame(data)
X, y = preprocess(df)

print("Preprocessed X Columns:", X.columns.tolist())
print("X shape:", X.shape)
print("y:", y.tolist())
print("\nFirst row of X:\n", X.iloc[0])
