"""
backend/models/document.py

DocumentUpload ORM model.
Linked to LoanApplication for optional trust verification.
"""
import enum
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey,
    Boolean, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime, timezone
from backend.database import Base


class VerificationStatus(str, enum.Enum):
    pending  = "pending"
    verified = "verified"
    mismatch = "mismatch"
    failed   = "failed"


class DocumentUpload(Base):
    """
    Tracks an applicant's uploaded document and the AI extraction results.
    Linked to LoanApplication (many-to-one).
    """
    __tablename__ = "document_uploads"

    id              = Column(Integer, primary_key=True, autoincrement=True, index=True)
    application_id  = Column(Integer, ForeignKey("loan_applications.id"), nullable=False, index=True)
    document_type   = Column(String(50), nullable=False)   # bank_statement | salary_slip | credit_report | loan_statement
    file_path       = Column(String(512), nullable=True)
    original_filename = Column(String(255), nullable=True)

    # ------------------------------------------------------------------
    # AI Extraction Results (stored as JSON text in SQLite)
    # ------------------------------------------------------------------
    extracted_data  = Column(Text, nullable=True)          # JSON string
    discrepancies   = Column(Text, nullable=True)          # JSON string list
    risk_flags      = Column(Text, nullable=True)          # JSON string list

    # ------------------------------------------------------------------
    # Verification Scores
    # ------------------------------------------------------------------
    verification_status = Column(String(20), default="pending")
    trust_score         = Column(Float,  default=0.0)          # 0–100
    document_risk_score = Column(Float,  default=0.0)
    ocr_confidence      = Column(Float,  default=0.0)
    processing_time_sec = Column(Float,  nullable=True)
    processed_at        = Column(DateTime, nullable=True)
    processed_by        = Column(String(50), default="text_layer")  # text_layer | tesseract

    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    application = relationship("LoanApplication", back_populates="documents")

    def __repr__(self):
        return f"<DocumentUpload(id={self.id}, type='{self.document_type}', trust={self.trust_score:.1f})>"
