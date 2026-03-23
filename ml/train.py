import os
import sys
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

# Ensure the script can import local modules from ml/ folder
curr_dir = os.path.dirname(os.path.abspath(__file__))
if curr_dir not in sys.path:
    sys.path.append(curr_dir)

from preprocess import preprocess

def train_models():
    """
    Loads data, trains 4 classifiers, evaluates them, and saves the best model.
    """
    # 1. Create Models Directory
    models_dir = os.path.join(curr_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    # 2. Load Dataset
    data_path = os.path.join(curr_dir, 'data', 'loan_base.csv')
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    df_base = pd.read_csv(data_path)

    # 3. Preprocess Data
    # preprocess(df) returns (X, y)
    X, y = preprocess(df_base)

    if y is None:
        print("Error: Target variable 'loan_status' not found in dataset.")
        return

    # 4. Stratified 80/20 Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=0.2, 
        random_state=42, 
        stratify=y
    )

    # 5. Initialize Models
    models_to_train = {
        'RandomForest': {
            'model': RandomForestClassifier(n_estimators=100, random_state=42),
            'file': 'model_rf.pkl'
        },
        'XGBoost': {
            'model': XGBClassifier(random_state=42, eval_metric='logloss'),
            'file': 'model_xgb.pkl'
        },
        'DecisionTree': {
            'model': DecisionTreeClassifier(random_state=42),
            'file': 'model_dt.pkl'
        },
        'LogisticRegression': {
            'model': LogisticRegression(max_iter=1000, random_state=42),
            'file': 'model_lr.pkl'
        }
    }

    best_f1 = -1
    best_model_name = ""
    best_model_obj = None

    print("--- Training Models ---")

    for name, config in models_to_train.items():
        model = config['model']
        filename = config['file']
        
        # Train
        model.fit(X_train, y_train)
        
        # Predict
        y_pred = model.predict(X_test)
        
        # Evaluation
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        
        print(f"\nModel: {name}")
        print(f"Accuracy:  {acc:.4f}")
        print(f"F1 Score:  {f1:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        
        # Save individual model
        joblib.dump(model, os.path.join(models_dir, filename))
        
        # Track best model by F1 Score
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = model

    # 6. Save the overall best model
    if best_model_obj:
        joblib.dump(best_model_obj, os.path.join(models_dir, 'model_current.pkl'))
        print("-" * 30)
        print(f"Training complete. Best model: {best_model_name}")
    else:
        print("Error: No models were trained.")

if __name__ == "__main__":
    train_models()
