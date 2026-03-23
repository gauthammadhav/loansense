from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base # Assumes backend/ is in the PYTHONPATH

class AuditLog(Base):
    """
    Immutable event log for maintaining system-wide traceability.
    Captures status changes, model retraining events, and officer overrides.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Relationships & Foreign Keys
    # Application association can be NULL for system-wide actions like model retraining
    application_id = Column(
        Integer, 
        ForeignKey("loan_applications.id"), 
        nullable=True
    )
    # Actor performing the change (Officer or Applicant, can be NULL for system-automated events)
    actor_id = Column(
        Integer, 
        ForeignKey("users.id"), 
        nullable=True
    )
    
    # Event Identification
    # e.g. 'officer_approved', 'ml_predicted', 'model_retrained'
    action = Column(String(100), nullable=False)
    
    # Supplemental Data for the transition stored as serialized JSON
    # Stores override reasons, model version, or confidence scores
    detail = Column(Text, nullable=True)
    
    # Audit Creation Timestamp
    created_at = Column(
        DateTime(timezone=True), 
        nullable=False, 
        server_default=func.now()
    )

    # Relationships (Optional but useful for lookups)
    application = relationship("LoanApplication", backref="audit_logs")
    actor = relationship("User", backref="audit_logs")

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', actor_id={self.actor_id})>"
