import joblib
import pandas as pd
import sys
import os

# Add current path for local imports
sys.path.append(r'c:\Users\gauth\Desktop\Projects\MiniProject_F\loansense')

from ml.shap_utils import get_shap_values
from ml.preprocess import FEATURE_COLUMNS

# Create a sample row
X_row = pd.DataFrame([[0]*len(FEATURE_COLUMNS)], columns=FEATURE_COLUMNS)

# Test RF
rf_path = r'c:\Users\gauth\Desktop\Projects\MiniProject_F\loansense\ml\models\model_rf.pkl'
if os.path.exists(rf_path):
    rf_model = joblib.load(rf_path)
    shap_rf = get_shap_values(rf_model, X_row, FEATURE_COLUMNS)
    print("RF SHAP Keys:", list(shap_rf.keys())[:5])
    print("RF SHAP type:", type(list(shap_rf.values())[0]))
else:
    print("RF Model not found")

# Test LR
lr_path = r'c:\Users\gauth\Desktop\Projects\MiniProject_F\loansense\ml\models\model_lr.pkl'
if os.path.exists(lr_path):
    lr_model = joblib.load(lr_path)
    shap_lr = get_shap_values(lr_model, X_row, FEATURE_COLUMNS)
    print("LR SHAP Keys:", list(shap_lr.keys())[:5])
    print("LR SHAP type:", type(list(shap_lr.values())[0]))
else:
    print("LR Model not found")
