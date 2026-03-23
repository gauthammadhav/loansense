import shap
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier

def get_shap_values(model, X_row, feature_names):
    """
    Calculates SHAP values for a single prediction row and returns a dictionary 
    mapping feature names to their respective SHAP contributions.
    
    Args:
        model: The trained machine learning model (RF, XGB, DT, or LR).
        X_row (pd.DataFrame): A single row of preprocessed feature data.
        feature_names (list): List of feature names corresponding to X_row columns.
        
    Returns:
        dict: A dictionary of {feature_name: float(shap_value)}.
    """
    # 1. Determine the appropriate SHAP Explainer
    if isinstance(model, (RandomForestClassifier, DecisionTreeClassifier, XGBClassifier)):
        explainer = shap.TreeExplainer(model)
        # TreeExplainer works directly on tree-based ensembles
        raw_shap_values = explainer.shap_values(X_row)
    elif isinstance(model, LogisticRegression):
        # LinearExplainer requires a data reference for feature dependence logic
        # Here we use the row itself as a minimal reference to satisfy the explainer
        explainer = shap.LinearExplainer(model, masker=shap.maskers.Independent(X_row))
        raw_shap_values = explainer.shap_values(X_row)
    else:
        # Fallback to the generic SHAP explainer
        explainer = shap.Explainer(model)
        raw_shap_values = explainer(X_row).values

    # 2. Extract values for the positive class (assuming binary classification)
    # Different explainers/models return SHAP values in different shapes/containers
    
    if isinstance(raw_shap_values, list):
        # Case for Random Forest/Decision Tree: returns list [class_0_values, class_1_values]
        # We take the values for class 1 (Loan Approved)
        # raw_shap_values[1] is (n_samples, n_features)
        selected_row_values = raw_shap_values[1][0]
    else:
        # Case for XGBoost/Linear: usually returns (n_samples, n_features) or (n_samples, n_features, n_classes)
        if len(raw_shap_values.shape) == 3:
            # (samples, features, classes)
            selected_row_values = raw_shap_values[0, :, 1]
        elif len(raw_shap_values.shape) == 2:
            # (samples, features)
            selected_row_values = raw_shap_values[0]
        else:
            selected_row_values = raw_shap_values

    # 3. Map to feature names and cast to native Python floats for JSON compatibility
    shap_dict = {}
    for i, name in enumerate(feature_names):
        # Ensure we are indexing correctly even if selected_row_values is slightly different
        val = selected_row_values[i]
        shap_dict[name] = float(val) # Crucial: numpy.float32/64 breaks JSON serialization
        
    return shap_dict
