# 📄 LoanSense — Credit Loan Approval Prediction System

LoanSense is a full-stack Credit Loan Approval Prediction System that uses Machine Learning to automate and explain loan approval decisions. This project integrates a FastAPI backend, a React frontend, and an XGBoost-based ML pipeline with SHAP explainability.

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd loansense
```

### 2. Backend Setup (Python)

Ensure you have **Python 3.11+** installed.

#### Create a Virtual Environment:
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### Install Dependencies:
```bash
pip install -r requirements.txt
```

#### Environment Variables:
Ensure there is a `.env` file in the root/backend directory with the following (or similar) content:
```env
DATABASE_URL=sqlite:///./loansense.db
SECRET_KEY=yoursecretkeyhere
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Initialize Database & Seed Data:
The database (`loansense.db`) will be created automatically on the first run, but you can seed it with initial users (Applicant & Officer) and sample applications.
```bash
python -m backend.seed
```
*Note: Default users are often `applicant@loansense.com` and `officer@loansense.com` (password: `password123`).*

---

### 3. Machine Learning Setup

The system requires pre-trained models and data files in the following structure:
- `ml/data/loan_base.csv`
- `ml/models/model_current.pkl` (and variants like `model_rf.pkl`, `model_xgb.pkl`, etc.)

If these are not present, ensure you have run the training script:
```bash
python -m ml.train
```

---

### 4. Frontend Setup (React + Vite)

Ensure you have **Node.js 18+** and **npm** installed.

#### Navigate to the Frontend Directory:
```bash
cd frontend
```

#### Install Dependencies:
```bash
npm install
```

---

### 5. Running the Application

You need to run both the backend and frontend simultaneously.

#### Start Backend (Port 8000):
From the **root directory**:
```bash
uvicorn backend.main:app --reload --port 8000
```

#### Start Frontend (Port 5173):
From the **frontend directory**:
```bash
npm run dev
```

---

## 🛠️ Tech Stack
- **Backend:** FastAPI, SQLAlchemy, SQLite, Pydantic, Python-jose
- **Frontend:** React 18, Vite, Tailwind CSS v4, Lucide-React, Recharts, Zustand
- **ML Engine:** XGBoost, Scikit-Learn, SHAP, Joblib

## 📈 System Features
- **Applicant Portal:** 5-step application wizard, real-time prediction, AI explainability (SHAP).
- **Officer Portal:** FIFO decision queue, SLA tracking, manual review with audit history.
- **MLOps Dashboard:** Performance metrics tracking, automated retraining queue, and model comparison.

---
*Created for the College Mini Project — Banking & FinTech Domain.*
