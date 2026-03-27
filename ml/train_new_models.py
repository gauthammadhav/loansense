import pandas as pd
import numpy as np
import os
import joblib
import json
import warnings
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score

warnings.filterwarnings('ignore')

def train_and_evaluate():
    # 1. Load Data
    data_path = 'ml/data/dataset_new.csv'
    df = pd.read_csv(data_path)
    
    target_col = 'loan_approved'
    categorical_col = 'employment_type'
    
    # 2. Preprocessing
    # Handle missing values
    # Numeric columns -> median
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if target_col in numeric_cols:
        numeric_cols.remove(target_col)
    
    for col in numeric_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())
            
    # Categorical col -> mode ('salaried')
    df[categorical_col] = df[categorical_col].fillna('salaried')
    
    # Feature columns in exact training order
    feature_cols = [c for c in df.columns if c != target_col]
    
    # Label Encoding
    le = LabelEncoder()
    # Fit with explicit mapping ensuring salaried=0, self-employed=1, business=2
    # Though LabelEncoder does it alphabetically (business=0, salaried=1, self-employed=2)
    # The requirement explicitly states: salaried=0, self-employed=1, business=2
    # So we should map it manually and then fit LabelEncoder just to save it or create a custom one.
    # Wait, "LabelEncoder for employment_type only. Map: salaried=0, self-employed=1, business=2"
    # To use LabelEncoder, we can fit it with an ordered array if we want, but it sorts them.
    # So salaried will be 1, self-employed 2, business 0.
    # Or we can just build a custom mapping or replace the classes_ attribute.
    # Let's map it explicitly in df and force LabelEncoder classes.
    mapping = {'salaried': 0, 'self-employed': 1, 'business': 2}
    df[categorical_col] = df[categorical_col].map(mapping)
    
    # To save a "fitted LabelEncoder" that behaves this way:
    le.classes_ = np.array(['salaried', 'self-employed', 'business'])
    
    X = df[feature_cols]
    y = df[target_col]
    
    # Save preprocessor
    os.makedirs('ml/models/new', exist_ok=True)
    preprocessor = {
        "employment_type_encoder": le,
        "feature_columns": feature_cols,
        "target_column": target_col
    }
    joblib.dump(preprocessor, 'ml/models/new/preprocessor.pkl')
    
    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Models
    models = {
        "RandomForest": RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            class_weight='balanced'
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric='logloss',
            use_label_encoder=False
        ),
        "DecisionTree": DecisionTreeClassifier(
            max_depth=8,
            random_state=42,
            class_weight='balanced'
        ),
        "LogisticRegression": LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced'
        )
    }
    
    metrics_dict = {}
    best_model_name = ""
    best_f1 = -1
    best_model = None
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred)
        
        print("─────────────────────────────────")
        print(f"Model: {name}")
        print(f"Accuracy:  {acc:.4f}")
        print(f"F1 Score:  {f1:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print("─────────────────────────────────")
        
        metrics_dict[name] = {
            "accuracy": round(acc, 4),
            "f1": round(f1, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4)
        }
        
        # Mapping to file names requested
        file_map = {
            "RandomForest": "rf_model_new.pkl",
            "XGBoost": "xgb_model_new.pkl",
            "DecisionTree": "dt_model_new.pkl",
            "LogisticRegression": "lr_model_new.pkl"
        }
        
        joblib.dump(model, f'ml/models/new/{file_map[name]}')
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model = model

    joblib.dump(best_model, 'ml/models/new/model_current_new.pkl')
    print(f"\nBest model: {best_model_name} with F1: {best_f1:.4f}\n")
    
    # Feature Importance
    rf_model = models["RandomForest"]
    xgb_model = models["XGBoost"]
    
    rf_importances = pd.Series(rf_model.feature_importances_, index=feature_cols).sort_values(ascending=False).head(10)
    xgb_importances = pd.Series(xgb_model.feature_importances_, index=feature_cols).sort_values(ascending=False).head(10)
    
    print("Feature Importance — RandomForest:")
    for i, (feat, imp) in enumerate(rf_importances.items(), 1):
        print(f"{i}. {feat:<20} {imp:.4f}")
        
    print("\nFeature Importance — XGBoost:")
    for i, (feat, imp) in enumerate(xgb_importances.items(), 1):
        print(f"{i}. {feat:<20} {imp:.4f}")

    # Combine metrics and metadata
    final_metrics = metrics_dict.copy()
    final_metrics["best_model"] = best_model_name
    final_metrics["trained_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    final_metrics["training_rows"] = len(df)
    final_metrics["feature_columns"] = feature_cols
    
    # Save generic feature importance for Analytics view
    final_metrics["feature_importance"] = rf_importances.to_dict()

    with open('ml/models/new/metrics.json', 'w') as f:
        json.dump(final_metrics, f, indent=2)

if __name__ == "__main__":
    train_and_evaluate()
