import os
import joblib
import pandas as pd
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sklearn.metrics import accuracy_score

from backend.config import settings
from backend.middleware.auth_middleware import get_current_user, get_current_officer
from backend.services.retraining_service import maybe_retrain
from ml.preprocess import preprocess

# 1. Router Configuration
router = APIRouter(prefix="/model", tags=["Model Info"])

@router.get("/current")
def get_current_model_info(current_user=Depends(get_current_user)):
    """
    Returns metadata about the currently active production model.
    """
    model_path = os.path.join(settings.MODEL_PATH, "model_current.pkl")
    status = "loaded" if os.path.exists(model_path) else "not_found"
    
    return {
        "version": "current",
        "path": model_path,
        "status": status
    }

@router.get("/queue-status")
def get_retraining_queue_status(current_user=Depends(get_current_officer)):
    """
    Checks the status of the new submissions buffer and distance to the next auto-retrain.
    """
    queue_path = os.path.join(settings.DATA_PATH, "new_submissions.csv")
    
    if not os.path.exists(queue_path):
        return {
            "queued": 0, 
            "threshold": settings.RETRAIN_THRESHOLD,
            "next_retrain_in": settings.RETRAIN_THRESHOLD
        }
    
    try:
        df = pd.read_csv(queue_path)
        row_count = len(df)
    except:
        row_count = 0
        
    return {
        "queued": row_count,
        "threshold": settings.RETRAIN_THRESHOLD,
        "next_retrain_in": max(0, settings.RETRAIN_THRESHOLD - row_count)
    }

@router.post("/retrain")
def manual_retrain_trigger(current_user=Depends(get_current_officer)):
    """
    Manually triggers a retraining cycle using all currently buffered data,
    ignoring the auto-retrain threshold.
    """
    # Force retraining regardless of queue size
    result = maybe_retrain(force=True)
    
    if result:
        return {
            "message": "Manual retraining successful",
            "metrics": result
        }
    else:
        return {
            "message": "Retraining skipped - no new data available in queue",
            "metrics": None
        }

@router.get("/comparison")
def get_model_comparison(current_user=Depends(get_current_officer)):
    """
    Loads all saved classifiers and evaluates them against a validation subset 
    of the base dataset to identify the top performer.
    """
    # 1. Load and Preprocess Validation Data
    base_data_path = os.path.join(settings.DATA_PATH, "loan_base.csv")
    if not os.path.exists(base_data_path):
        raise HTTPException(status_code=404, detail="Base dataset not found")
        
    df_base = pd.read_csv(base_data_path)
    X, y = preprocess(df_base)
    
    # Take a small stable sample for quick comparison (last 100 rows)
    X_test = X.tail(100)
    y_test = y.tail(100)
    
    # 2. Define models to compare
    model_files = {
        "Random Forest": "model_rf.pkl",
        "XGBoost": "model_xgb.pkl",
        "Decision Tree": "model_dt.pkl",
        "Logistic Regression": "model_lr.pkl"
    }
    
    results = []
    
    # 3. Load and evaluate each
    for name, filename in model_files.items():
        path = os.path.join(settings.MODEL_PATH, filename)
        if os.path.exists(path):
            try:
                model = joblib.load(path)
                y_pred = model.predict(X_test)
                acc = accuracy_score(y_test, y_pred)
                results.append({
                    "name": name,
                    "accuracy": round(acc, 4),
                    "file": filename
                })
            except Exception as e:
                results.append({"name": name, "error": str(e)})
        else:
            results.append({"name": name, "status": "not_trained"})
            
    return results
