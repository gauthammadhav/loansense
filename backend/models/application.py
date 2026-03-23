import enum
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base


class ApplicationStatus(str, enum.Enum):
    """
    State machine for loan application processing.
    """
    submitted = "submitted"
    under_review = "under_review"
    approved = "approved"
    rejected = "rejected"
    escalated = "escalated"

class LoanApplication(Base):
    """
    Master model for storing loan application details, applicant data,
    ML prediction scores, and final bank officer decisions.
    """
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Relationships & Foreign Keys
    applicant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Application State
    status = Column(
        Enum(ApplicationStatus), 
        nullable=False, 
        default=ApplicationStatus.submitted,
        server_default=ApplicationStatus.submitted.value
    )
    
    # Core Applicant Features (Raw)
    gender = Column(String(10), nullable=False)
    married = Column(Boolean, nullable=False)
    dependents = Column(Integer, nullable=False, default=0, server_default="0")
    education = Column(String(20), nullable=False)
    self_employed = Column(Boolean, nullable=False, default=False, server_default="0")
    
    # Financial Details
    applicant_income = Column(Float, nullable=False)
    coapplicant_income = Column(Float, nullable=False, default=0.0, server_default="0.0")
    loan_amount = Column(Float, nullable=False)
    loan_amount_term = Column(Integer, nullable=False, default=360, server_default="360")
    credit_score = Column(Integer, nullable=False)
    
    # Property & Intent
    property_type = Column(String(30), nullable=False) # Urban / Semiurban / Rural
    property_area = Column(String(50), nullable=True)
    purpose = Column(String(50), nullable=True)
    
    # ML Prediction Engine Results
    ml_prediction = Column(String(10), nullable=True) # Y / N
    ml_confidence = Column(Float, nullable=True)      # 0.0 - 1.0 probability
    ml_risk_band = Column(String(20), nullable=True)  # Low / Medium / High / Very High
    shap_values = Column(Text, nullable=True)         # Serialized JSON dictionary
    
    # Officer Review Data
    officer_decision = Column(String(10), nullable=True) # Y / N
    override_reason = Column(Text, nullable=True)
    pdf_path = Column(String(500), nullable=True)
    
    # Timestamps
    submitted_at = Column(
        DateTime(timezone=True), 
        nullable=False, 
        server_default=func.now()
    )
    decided_at = Column(DateTime(timezone=True), nullable=True)
    
    # MLOps Flag
    # Prevents training data leakage (re-using the same application for training)
    fed_to_training = Column(Boolean, nullable=False, default=False, server_default="0")

    # Relationships (Optional based on requirements, but added for convenience)
    applicant = relationship("User", foreign_keys=[applicant_id], backref="applications")
    officer = relationship("User", foreign_keys=[officer_id], backref="reviews")

    def __repr__(self):
        return f"<LoanApplication(id={self.id}, applicant_id={self.applicant_id}, status='{self.status}')>"
