from typing import List, Optional
from datetime import datetime, timezone
import json
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models.user import User
from backend.models.application import LoanApplication, ApplicationStatus
from backend.models.audit_log import AuditLog
from backend.schemas.officer import (
    OfficerDecisionRequest, 
    ApplicationQueueItem, 
    OfficerApplicationDetail, 
    EscalateRequest
)
from backend.services.retraining_service import append_to_training_queue, maybe_retrain
from backend.middleware.auth_middleware import get_current_officer

# 1. Router Configuration
router = APIRouter(prefix="/officer", tags=["Officer"])

@router.get("/queue", response_model=List[ApplicationQueueItem])
def get_decision_queue(
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """
    Retrieves all applications awaiting an officer's review.
    Prioritizes the oldest submissions (First-In, First-Out).
    """
    # 1. Fetch pending and active review items
    apps = db.query(LoanApplication).filter(
        LoanApplication.status.in_([ApplicationStatus.submitted, ApplicationStatus.under_review])
    ).order_by(LoanApplication.submitted_at.asc()).all()
    
    # 2. Enrich with pending duration
    now = datetime.now(timezone.utc)
    for app in apps:
        # Calculate days since submission for SLA tracking
        delta = now - app.submitted_at
        app.days_pending = delta.days
        
    return apps

@router.get("/applications", response_model=List[OfficerApplicationDetail])
def list_all_applications(
    status_filter: Optional[str] = None,
    risk_filter: Optional[str] = None,
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """
    Searchable view of all historical applications for auditing and oversight.
    """
    query = db.query(LoanApplication)
    
    if status_filter:
        query = query.filter(LoanApplication.status == status_filter)
    if risk_filter:
        query = query.filter(LoanApplication.ml_risk_band == risk_filter)
        
    return query.order_by(LoanApplication.submitted_at.desc()).all()

@router.post("/assign/{application_id}", response_model=OfficerApplicationDetail)
def assign_application(
    application_id: int,
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """
    Claims an application by the current officer for review.
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # 1. Update assignment
    app.officer_id = current_user.id
    app.status = ApplicationStatus.under_review
    
    db.commit()
    db.refresh(app)
    
    # 2. Log access
    audit = AuditLog(
        application_id=app.id,
        actor_id=current_user.id,
        action="officer_assigned",
        detail=json.dumps({"officer": current_user.email})
    )
    db.add(audit)
    db.commit()
    
    return app

@router.post("/decide/{application_id}")
def make_decision(
    application_id: int,
    request: OfficerDecisionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """
    The final step of the loan review process.
    Updates the final status and triggers the MLOps retraining pipeline.
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    # 1. Persist the Officer's human decision
    app.officer_decision = request.decision
    app.override_reason = request.override_reason
    app.decided_at = datetime.now(timezone.utc)
    app.officer_id = current_user.id
    
    if request.decision == "Y":
        app.status = ApplicationStatus.approved
    else:
        app.status = ApplicationStatus.rejected
        
    # Standardize flag for retraining pipeline
    app.fed_to_training = False 
    db.commit()
    
    # 2. Log Decision Outcome
    audit = AuditLog(
        application_id=app.id,
        actor_id=current_user.id,
        action=f"officer_{app.status.value}", # officer_approved or officer_rejected
        detail=json.dumps({
            "decision": request.decision,
            "override_reason": request.override_reason,
            "ml_prediction": app.ml_prediction
        })
    )
    db.add(audit)
    
    # 3. Synchronous Queue for Retraining
    # We must ensure the data is captured in the staging area immediately
    app_fields = {
        "gender": app.gender,
        "married": app.married,
        "dependents": app.dependents,
        "education": app.education,
        "self_employed": app.self_employed,
        "applicant_income": app.applicant_income,
        "coapplicant_income": app.coapplicant_income,
        "loan_amount": app.loan_amount,
        "loan_amount_term": app.loan_amount_term,
        "credit_score": app.credit_score,
        "property_type": app.property_type
    }
    
    queue_size = append_to_training_queue(app_fields, request.decision)
    
    # Mark as captured so we don't re-queue on accidental double clicks (if we had idempotency)
    app.fed_to_training = True
    db.commit()
    
    # 4. Asynchronous Retraining Trigger
    # Using background tasks ensures the API remains responsive while models train
    background_tasks.add_task(maybe_retrain)
    
    return {
        "status": "decision_saved",
        "application_id": app.id,
        "final_status": app.status.value,
        "queue_size": queue_size
    }

@router.post("/escalate/{application_id}", response_model=OfficerApplicationDetail)
def escalate_application(
    application_id: int,
    request: EscalateRequest,
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """
    Moves an application to higher authority or specialist review.
    """
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    app.status = ApplicationStatus.escalated
    db.commit()
    
    audit = AuditLog(
        application_id=app.id,
        actor_id=current_user.id,
        action="escalated",
        detail=json.dumps({"reason": request.reason})
    )
    db.add(audit)
    db.commit()
    db.refresh(app)
    
    return app
