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
    Loads all saved classifiers and evaluates them against a validation subset.
    Also reads from ml/models/new/metrics.json if it exists to append new models.
    """
    results = []
    
    # Check new metrics json first
    metrics_path = os.path.join(settings.MODEL_PATH, "new", "metrics.json")
    if os.path.exists(metrics_path):
        try:
            import json
            with open(metrics_path, 'r') as f:
                data = json.load(f)
                
            best = data.get("best_model")
            for model_name in ["RandomForest", "XGBoost", "DecisionTree", "LogisticRegression"]:
                if model_name in data:
                    model_data = data[model_name]
                    results.append({
                        "name": f"{model_name} (New)",
                        "accuracy": model_data.get("accuracy", 0),
                        "f1": model_data.get("f1", 0),
                        "precision": model_data.get("precision", 0),
                        "recall": model_data.get("recall", 0),
                        "best": (model_name == best)
                    })
        except Exception as e:
            print("Error reading new metrics:", e)

    # Base legacy comparison
    base_data_path = os.path.join(settings.DATA_PATH, "loan_base.csv")
    if os.path.exists(base_data_path):
        df_base = pd.read_csv(base_data_path)
        X, y = preprocess(df_base)
        X_test = X.tail(100)
        y_test = y.tail(100)
        
        model_files = {
            "Random Forest (Legacy)": "model_rf.pkl",
            "XGBoost (Legacy)": "model_xgb.pkl",
            "Decision Tree (Legacy)": "model_dt.pkl",
            "Logistic Regression (Legacy)": "model_lr.pkl"
        }
        
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

@router.get("/feature-importance")
def get_model_feature_importance(current_user=Depends(get_current_officer)):
    metrics_path = os.path.join(settings.MODEL_PATH, "new", "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="Metrics file not found. Feature importance is unavailable.")
        
    import json
    with open(metrics_path, 'r') as f:
        data = json.load(f)
        
    return data.get("feature_importance", {})

@router.get("/dataset-stats")
def get_model_dataset_stats(current_user=Depends(get_current_officer)):
    data_path = os.path.join(settings.DATA_PATH, "dataset_new.csv")
    if not os.path.exists(data_path):
        raise HTTPException(status_code=404, detail="New dataset not found")
        
    df = pd.read_csv(data_path)
    total_rows = len(df)
    
    if "loan_approved" in df.columns:
        approved_count = int(df["loan_approved"].sum())
        rejected_count = total_rows - approved_count
        approval_rate = round((approved_count / total_rows) * 100, 2) if total_rows > 0 else 0
    else:
        approved_count, rejected_count, approval_rate = 0, 0, 0
        
    avg_mi = round(df["monthly_income"].mean(), 2) if "monthly_income" in df.columns else 0
    avg_la = round(df["loan_amount"].mean(), 2) if "loan_amount" in df.columns else 0
    avg_cs = round(df["credit_score"].mean(), 2) if "credit_score" in df.columns else 0
    avg_dti = round(df["debt_to_income"].mean(), 4) if "debt_to_income" in df.columns else 0
    
    emp_dist = {}
    if "employment_type" in df.columns:
        counts = df["employment_type"].value_counts().to_dict()
        emp_dist = {
            "salaried": int(counts.get("salaried", 0)),
            "self-employed": int(counts.get("self-employed", 0)),
            "business": int(counts.get("business", 0))
        }
        
    return {
        "total_rows": total_rows,
        "approved_count": approved_count,
        "rejected_count": rejected_count,
        "approval_rate": approval_rate,
        "avg_monthly_income": avg_mi,
        "avg_loan_amount": avg_la,
        "avg_credit_score": avg_cs,
        "avg_dti": avg_dti,
        "employment_distribution": emp_dist
    }
