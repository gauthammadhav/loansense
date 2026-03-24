from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import Base, engine
from backend.models import User, LoanApplication, AuditLog, ModelVersion
from backend.routes.auth import router as auth_router
from backend.routes.applications import router as applications_router
from backend.routes.predict import router as predict_router



# Create FastAPI instance with project metadata
app = FastAPI(
    title="LoanSense API",
    version="1.0.0",
    description="Credit Loan Approval Prediction System"
)

# Configure CORS for the Vite development server
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Router Integration
app.include_router(auth_router)
app.include_router(applications_router)
app.include_router(predict_router)



# On startup, ensure all database tables are created automatically
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# Root route providing basic API info
@app.get("/")
def read_root():
    return {
        "message": "LoanSense API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
