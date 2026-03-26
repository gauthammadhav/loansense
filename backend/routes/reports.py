from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from backend.services.pdf_service import generate_decision_pdf
from backend.models.application import LoanApplication
from backend.models.user import User
from backend.middleware.auth_middleware import get_current_user, get_current_officer
from backend.database import get_db
import pandas as pd
import io

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/pdf/{application_id}")
def get_pdf(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == "applicant":
        if application.applicant_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this PDF")

    applicant = db.query(User).filter(User.id == application.applicant_id).first()
    
    officer = None
    if application.officer_id:
        officer = db.query(User).filter(User.id == application.officer_id).first()

    if application.officer_decision is None:
        raise HTTPException(
            status_code=400, 
            detail="PDF can only be generated after a final officer decision has been made"
        )

    file_path = generate_decision_pdf(application, applicant, officer)

    application.pdf_path = file_path
    db.commit()

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"LoanSense_Decision_{application_id}.pdf"
    )

@router.get("/export-csv")
def export_csv(
    status: str = None,
    risk_band: str = None,
    current_officer: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    query = db.query(LoanApplication)
    
    if status:
        query = query.filter(LoanApplication.status == status)
    if risk_band:
        query = query.filter(LoanApplication.ml_risk_band == risk_band)
        
    applications = query.all()
    
    # Safely convert to DataFrame by dropping SQLAlchemy internal states
    data = [app.__dict__ for app in applications]
    df = pd.DataFrame(data)
    if '_sa_instance_state' in df.columns:
        df = df.drop(columns=['_sa_instance_state'])
        
    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=loansense_applications.csv"}
    )
