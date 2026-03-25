from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import JSONResponse
import traceback
from backend.database import Base, engine
from backend.models import User, LoanApplication, AuditLog, ModelVersion
from backend.routes.auth import router as auth_router
from backend.routes.applications import router as applications_router
from backend.routes.predict import router as predict_router
from backend.routes.officer import router as officer_router
from backend.routes.model_info import router as model_info_router



# 1. App Initialization
app = FastAPI(
    title="LoanSense API",
    version="1.0.0",
    description="Credit Loan Approval Prediction System"
)

# 2. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Global Exception Handler for Debugging
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: {str(exc)}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()}
    )

# 4. Router Integration
app.include_router(auth_router)
app.include_router(applications_router)
app.include_router(predict_router)
app.include_router(officer_router)
app.include_router(model_info_router)



# 5. Database Startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# 6. Root Health Check
@app.get("/")
def read_root():
    return {"status": "online", "message": "LoanSense API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
