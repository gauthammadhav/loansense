import os
import pandas as pd
import joblib
from datetime import datetime
from backend.config import settings
from ml.train import train_models

# 1. Path Configuration
# These are derived from settings but given explicit names for readability
NEW_DATA_FILE = os.path.join(settings.DATA_PATH, "new_submissions.csv")
BASE_DATA_FILE = os.path.join(settings.DATA_PATH, "loan_base.csv")

def append_to_training_queue(application_data: dict, final_decision: str) -> int:
    """
    Appends a finalized loan application (with known outcome) to the 
    buffer file for future retraining.
    """
    # 1. Prepare data (ensure it matches the training CSV format)
    # The training script expects 'loan_status' for the target variable
    row = application_data.copy()
    row["loan_status"] = final_decision
    
    # Standardize columns to lower case if they aren't already 
    # (The Kaggle dataset might use mixed case, but our preprocess.py handles it)
    new_df = pd.DataFrame([row])
    
    # 2. Persist to CSV
    if os.path.exists(NEW_DATA_FILE):
        new_df.to_csv(NEW_DATA_FILE, mode='a', header=False, index=False)
    else:
        new_df.to_csv(NEW_DATA_FILE, mode='w', header=True, index=False)
        
    # 3. Return current queue size
    return len(pd.read_csv(NEW_DATA_FILE))

def maybe_retrain(force: bool = False) -> dict:
    """
    Checks if the number of new submissions exceeds the threshold (or if forced).
    If yes, triggers a new training cycle and archives the model.
    """
    # 1. Check if retraining is possible/needed
    if not os.path.exists(NEW_DATA_FILE):
        return None
        
    new_data = pd.read_csv(NEW_DATA_FILE)
    if not force and len(new_data) < settings.RETRAIN_THRESHOLD:
        return None

        
    # 2. Combine Datasets
    # Combine old ground truth with newly approved/rejected applications
    base_data = pd.read_csv(BASE_DATA_FILE)
    combined_df = pd.concat([base_data, new_data], ignore_index=True)
    
    # 3. Trigger Retraining
    # This runs the full pipeline: Preprocessing -> Split -> Train -> Best Model Selection
    metrics = train_models(data=combined_df)
    
    if metrics:
        # 4. Versioning and Archiving
        # Archive the new model with a version number
        # We check the directory to determine the next version index
        existing_models = [f for f in os.listdir(settings.MODEL_PATH) if f.startswith("model_v")]
        version = len(existing_models) + 1
        
        # model_current.pkl is always the latest, created by train_models()
        # We copy it to model_vN.pkl for records
        current_model_path = os.path.join(settings.MODEL_PATH, "model_current.pkl")
        versioned_model_path = os.path.join(settings.MODEL_PATH, f"model_v{version}.pkl")
        
        # Use joblib to "copy" simply by re-saving or just use filesystem copy
        # Re-saving ensures it's a valid joblib file
        model = joblib.load(current_model_path)
        joblib.dump(model, versioned_model_path)
        
        # 5. Cleanup
        # Clear the queue for the next batch
        os.remove(NEW_DATA_FILE)
        
        metrics["version"] = version
        return metrics
        
    return None
