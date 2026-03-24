import joblib
import pandas as pd
import os
from backend.config import settings
from ml.preprocess import preprocess, FEATURE_COLUMNS
from ml.shap_utils import get_shap_values

# 1. Global Cache for the ML model
# This ensures we don't reload the .pkl file from disk on every request
_model = None

def get_model():
    """
    Lazy loader for the trained machine learning model.
    Loads from the disk once and then serves from memory.
    """
    global _model
    if _model is None:
        model_path = os.path.join(settings.MODEL_PATH, "model_current.pkl")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"ML model not found at {model_path}. Please run training first.")
        _model = joblib.load(model_path)
    return _model

def compute_risk_band(confidence: float) -> str:
    """
    Maps the statistical probability of approval to discrete risk bands 
    for business readability.
    """
    if confidence >= 0.75:
        return "Low"
    elif confidence >= 0.55:
        return "Medium"
    elif confidence >= 0.35:
        return "High"
    else:
        return "Very High"

def run_prediction(application_data: dict) -> dict:
    """
    Orchestrates the full ML inference pipeline:
    Data Preparation -> Preprocessing -> Inference -> Explainability (SHAP).
    """
    # 1. Standardize input format
    # Ensure columns match the exact specification of the preprocessing engine
    raw_df = pd.DataFrame([application_data])
    
    # 2. Preprocessing
    # Transform raw inputs into encoded, engineered features
    X_processed, _ = preprocess(raw_df)
    
    # 3. Model Inference
    model = get_model()
    # predict_proba returns [prob_class_0, prob_class_1]
    # prob[0][1] is the probability of approval (Class 1)
    proba = model.predict_proba(X_processed)
    confidence = float(proba[0][1])
    
    # 4. Result Classification
    prediction = "Y" if confidence >= 0.5 else "N"
    risk_band = compute_risk_band(confidence)
    
    # 5. Explainability (Feature Impact Analysis)
    # Uses SHAP to determine which fields influenced this specific decision most
    shap_dict = get_shap_values(
        model=model,
        X_row=X_processed,
        feature_names=FEATURE_COLUMNS
    )
    
    # 6. Response Assembly
    return {
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "risk_band": risk_band,
        "shap_values": shap_dict,
        "model_version": "current"
    }
