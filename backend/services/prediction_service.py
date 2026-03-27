import joblib
import pandas as pd
import os
import shap
from backend.config import settings
from ml.preprocess import preprocess, FEATURE_COLUMNS
from ml.shap_utils import get_shap_values
from ml.new_preprocess import preprocess_new, compute_derived_features, FEATURE_COLUMNS_NEW

# Module-level cache
_model_new = None
_model_old = None

def get_model():
    global _model_new, _model_old
    
    # Try new model first
    new_model_path = os.path.join(settings.MODEL_PATH, "new", "model_current_new.pkl")
    if os.path.exists(new_model_path):
        if _model_new is None:
            _model_new = joblib.load(new_model_path)
        return _model_new, "new_v1"
        
    # Fallback to old model
    old_model_path = os.path.join(settings.MODEL_PATH, "model_current.pkl")
    if os.path.exists(old_model_path):
        if _model_old is None:
            _model_old = joblib.load(old_model_path)
        return _model_old, "legacy"
        
    raise FileNotFoundError("No ML models found. Please run training first.")

def compute_risk_band(confidence: float) -> str:
    if confidence >= 0.80:
        return "Low"
    elif confidence >= 0.60:
        return "Medium"
    elif confidence >= 0.40:
        return "High"
    else:
        return "Very High"

def run_prediction(application_data: dict) -> dict:
    raw_df = pd.DataFrame([application_data])
    X_processed, _ = preprocess(raw_df)
    
    model, model_type = get_model()
    proba = model.predict_proba(X_processed)
    confidence = float(proba[0][1])
    
    prediction = "Y" if confidence >= 0.5 else "N"
    risk_band = compute_risk_band(confidence)
    
    shap_dict = get_shap_values(
        model=model,
        X_row=X_processed,
        feature_names=FEATURE_COLUMNS
    )
    
    return {
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "risk_band": risk_band,
        "shap_values": shap_dict,
        "model_version": model_type
    }

def run_prediction_new(application_data: dict) -> dict:
    """
    Main prediction function for new dataset format.
    application_data contains the raw form fields.
    """
    # Step 1: Compute derived features
    data_with_derived = compute_derived_features(application_data)
    
    # Step 2: Preprocess
    X = preprocess_new(data_with_derived)
    
    # Step 3: Load model and predict
    model, model_type = get_model()
    proba = model.predict_proba(X)
    confidence = float(proba[0][1])
    prediction = "Y" if confidence >= 0.5 else "N"
    risk_band = compute_risk_band(confidence)
    
    # Step 4: Compute SHAP values
    shap_dict = {}
    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.tree import DecisionTreeClassifier
        from sklearn.linear_model import LogisticRegression
        from xgboost import XGBClassifier
        
        if isinstance(model, (RandomForestClassifier, DecisionTreeClassifier, XGBClassifier)):
            explainer = shap.TreeExplainer(model)
            # TreeExplainer works directly on tree-based ensembles
            shap_vals = explainer.shap_values(X)
            if isinstance(shap_vals, list):
                vals = shap_vals[1][0]
            elif len(shap_vals.shape) == 3:
                vals = shap_vals[0, :, 1]
            elif len(shap_vals.shape) == 2:
                vals = shap_vals[0]
            else:
                vals = shap_vals
            for i, name in enumerate(FEATURE_COLUMNS_NEW):
                shap_dict[name] = float(vals[i])
                
        elif isinstance(model, LogisticRegression):
            explainer = shap.LinearExplainer(model, masker=shap.maskers.Independent(X))
            shap_vals = explainer.shap_values(X)
            vals = shap_vals[0] if len(shap_vals.shape) == 2 else shap_vals
            for i, name in enumerate(FEATURE_COLUMNS_NEW):
                shap_dict[name] = float(vals[i])
                
    except Exception:
        shap_dict = {}
        
    # Step 5: Return dict
    return {
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "risk_band": risk_band,
        "shap_values": shap_dict,
        "model_version": "new_v1" if model_type == "new_v1" else "legacy",
        "derived_features": {
            "new_emi": float(data_with_derived.get("new_emi", 0)),
            "debt_to_income": float(data_with_derived.get("debt_to_income", 0)),
            "disposable_income": float(data_with_derived.get("disposable_income", 0))
        }
    }
