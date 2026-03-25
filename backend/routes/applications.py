import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User, UserRole
from backend.models.application import LoanApplication, ApplicationStatus
from backend.models.audit_log import AuditLog
from backend.schemas.application import LoanApplicationCreate, LoanApplicationResponse, ApplicationListItem
from backend.services.prediction_service import run_prediction
from backend.middleware.auth_middleware import get_current_applicant, get_current_user

# 1. API Route Configuration
router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/", response_model=LoanApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: LoanApplicationCreate, 
    current_user: User = Depends(get_current_applicant), 
    db: Session = Depends(get_db)
):
    """
    Applicant-only endpoint to submit a new loan application.
    Automatically triggers the ML prediction engine.
    """
    # 1. Create the base application record
    new_app = LoanApplication(
        applicant_id=current_user.id,
        status=ApplicationStatus.submitted,
        **app_in.model_dump()
    )
    
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    # 2. Run machine learning prediction
    # Converts pydantic schema to dictionary for the prediction service
    try:
        result = run_prediction(app_in.model_dump())
    except Exception as e:
        # If ML service fails, we keep the app record but set an error state or raise
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Machine Learning prediction failed: {str(e)}"
        )
        
    # 3. Update application with inference results
    new_app.ml_prediction = result["prediction"]
    new_app.ml_confidence = result["confidence"]
    new_app.ml_risk_band = result["risk_band"]
    new_app.shap_values = json.dumps(result["shap_values"])
    
    db.commit()
    
    # 4. Audit Log Entry
    # Tracks the automated system decision for traceability
    audit = AuditLog(
        application_id=new_app.id,
        actor_id=current_user.id,
        action="ml_predicted",
        detail=json.dumps({
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "model_version": result["model_version"]
        })
    )
    db.add(audit)
    db.commit()
    
    # 5. Prepare Response
    # Pydantic's from_attributes=True and our new pre-validator handle serialization
    return new_app

@router.get("/", response_model=List[ApplicationListItem])
def list_my_applications(
    current_user: User = Depends(get_current_applicant),
    db: Session = Depends(get_db)
):
    """
    Applicant-only endpoint to retrieve their own application history.
    """
    apps = db.query(LoanApplication).filter(
        LoanApplication.applicant_id == current_user.id
    ).order_by(LoanApplication.submitted_at.desc()).all()
    
    return apps

@router.get("/{application_id}", response_model=LoanApplicationResponse)
def get_application_detail(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Role-agnostic endpoint to view application details.
    Applicants can only see their own; Officers can see all.
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
        
    # Permission verification
    if current_user.role == UserRole.applicant and app.applicant_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this application"
        )
        
    # Prepare Response
    # Pydantic's from_attributes=True and our new pre-validator handle serialization
    return app
