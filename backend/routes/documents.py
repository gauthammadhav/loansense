"""
backend/routes/documents.py

Document upload and verification API routes.
"""
import json
import os
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.middleware.auth_middleware import get_current_user
from backend.models.application import LoanApplication
from backend.models.document import DocumentUpload
from backend.models.user import User, UserRole
from backend.services.document_service import (
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    DOC_TYPES,
    DocumentProcessor,
)

router = APIRouter(prefix="/documents", tags=["Documents"])


def _serialize_doc(doc: DocumentUpload) -> dict:
    def _parse(s):
        if not s:
            return {}
        try:
            return json.loads(s)
        except Exception:
            return {}

    return {
        "id":                  doc.id,
        "document_type":       doc.document_type,
        "original_filename":   doc.original_filename,
        "uploaded_at":         doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        "verification_status": doc.verification_status,
        "trust_score":         doc.trust_score,
        "extracted_data":      _parse(doc.extracted_data),
        "discrepancies":       _parse(doc.discrepancies),
        "risk_flags":          _parse(doc.risk_flags),
        "ocr_confidence":      doc.ocr_confidence,
        "document_risk_score": doc.document_risk_score,
        "processed_by":        doc.processed_by,
    }


# ── Upload ────────────────────────────────────────────────────────────────────

@router.post("/upload/{application_id}")
async def upload_document(
    application_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload and process a verification document for a loan application.

    **document_type** must be one of:
    - `bank_statement`
    - `salary_slip`
    - `credit_report`
    - `loan_statement`

    Supported formats: `.pdf`, `.jpg`, `.jpeg`, `.png` (max 10 MB)
    """

    # Validate document type
    if document_type not in DOC_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid document_type. Allowed: {list(DOC_TYPES.keys())}",
        )

    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}",
        )

    # Read and size-check
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit")

    # The application must exist; applicants can only upload to their own apps
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == UserRole.applicant and app.applicant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Process
    processor = DocumentProcessor(db)
    result = processor.process_document(
        application_id=application_id,
        file_bytes=file_bytes,
        filename=file.filename or f"doc_{application_id}.pdf",
        document_type=document_type,
    )

    return {
        "success": True,
        "message": "Document processed successfully",
        **result,
    }


# ── List Documents for an Application ────────────────────────────────────────

@router.get("/application/{application_id}")
def get_application_documents(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all uploaded documents and verification summary for an application."""

    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == UserRole.applicant and app.applicant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    docs = (
        db.query(DocumentUpload)
        .filter(DocumentUpload.application_id == application_id)
        .order_by(DocumentUpload.uploaded_at.desc())
        .all()
    )

    return {
        "application_id":         application_id,
        "documents_count":        len(docs),
        "overall_trust_score":    app.overall_trust_score or 0,
        "verification_status":    app.document_verification_status or "none",
        "verification_boost":     app.verification_boost or 0,
        "documents":              [_serialize_doc(d) for d in docs],
    }


# ── Verification Summary ──────────────────────────────────────────────────────

@router.get("/verification-summary/{application_id}")
def get_verification_summary(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Field-level comparison: what the user entered vs what documents show.
    Used by the Result page and the officer Review page.
    """

    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if current_user.role == UserRole.applicant and app.applicant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    docs = db.query(DocumentUpload).filter(DocumentUpload.application_id == application_id).all()

    # Retrieve form_data from shap_values blob
    form_data = {}
    try:
        raw = json.loads(app.shap_values) if app.shap_values else {}
        form_data = raw.get("form_data", {})
    except Exception:
        pass

    monthly_income   = form_data.get("monthly_income")   or app.applicant_income or 0
    monthly_expenses = form_data.get("monthly_expenses")  or 0
    credit_score     = form_data.get("credit_score")      or app.credit_score or 0

    field_summary: dict = {}

    for doc in docs:
        extracted = {}
        try:
            extracted = json.loads(doc.extracted_data) if doc.extracted_data else {}
        except Exception:
            pass

        if doc.document_type == "bank_statement":
            if "detected_income" in extracted:
                d = extracted["detected_income"]
                field_summary["monthly_income"] = {
                    "user_entered": monthly_income,
                    "document_verified": d,
                    "match": abs(monthly_income - d) <= monthly_income * 0.15,
                    "source": "bank_statement",
                }
            if "detected_expenses" in extracted:
                d = extracted["detected_expenses"]
                field_summary["monthly_expenses"] = {
                    "user_entered": monthly_expenses,
                    "document_verified": d,
                    "match": True if monthly_expenses == 0 else abs(monthly_expenses - d) <= monthly_expenses * 0.25,
                    "source": "bank_statement",
                }

        elif doc.document_type in ("salary_slip",):
            if "net_salary" in extracted:
                d = extracted["net_salary"]
                field_summary["monthly_income"] = {
                    "user_entered": monthly_income,
                    "document_verified": d,
                    "match": abs(monthly_income - d) <= monthly_income * 0.12,
                    "source": "salary_slip",
                }

        elif doc.document_type == "credit_report":
            if "credit_score" in extracted:
                d = extracted["credit_score"]
                field_summary["credit_score"] = {
                    "user_entered": credit_score,
                    "document_verified": d,
                    "match": abs(credit_score - d) <= 30,
                    "source": "credit_report",
                }

    matched = sum(1 for f in field_summary.values() if f.get("match"))
    total   = len(field_summary)

    recommendations = []
    if not docs:
        recommendations.append("Upload a bank statement to verify income and boost approval confidence")
        recommendations.append("Upload a CIBIL report to strengthen your credit profile")
    else:
        uploaded_types = {d.document_type for d in docs}
        if "bank_statement" not in uploaded_types:
            recommendations.append("Upload bank statement to verify income")
        if "credit_report" not in uploaded_types:
            recommendations.append("Upload CIBIL report to verify credit score")
        if (app.overall_trust_score or 0) < 70:
            recommendations.append("Some discrepancies detected — review your entered values")

    return {
        "application_id":      application_id,
        "documents_uploaded":  len(docs),
        "overall_trust_score": app.overall_trust_score or 0,
        "verification_status": app.document_verification_status or "none",
        "confidence_boost":    app.verification_boost or 0,
        "field_summary":       field_summary,
        "match_rate":          round(matched / total * 100, 1) if total else 0,
        "recommendations":     recommendations,
    }


# ── Delete ────────────────────────────────────────────────────────────────────

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a document (applicant only, on their own application)."""
    doc = db.query(DocumentUpload).filter(DocumentUpload.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    app = db.query(LoanApplication).filter(LoanApplication.id == doc.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Parent application not found")

    if current_user.role == UserRole.applicant and app.applicant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Remove physical file
    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()

    return {"success": True, "deleted_id": document_id}
