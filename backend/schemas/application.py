from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, Dict, List
from backend.models.application import ApplicationStatus

# 1. Base Fields (Shared properties)
class LoanApplicationBase(BaseModel):
    gender: str = Field(..., description="Male / Female")
    married: bool
    dependents: int = Field(..., ge=0, le=4)
    education: str = Field(..., description="Graduate / Not Graduate")
    self_employed: bool
    applicant_income: float
    coapplicant_income: float = 0.0
    loan_amount: float
    loan_amount_term: int = 360
    credit_score: int = Field(..., ge=300, le=900)
    property_type: str = Field(..., description="Urban / Semiurban / Rural")
    property_area: Optional[str] = ""
    purpose: Optional[str] = "Other"

# 2. Input Schema (Submission)
class LoanApplicationCreate(LoanApplicationBase):
    pass

# 3. Detailed Response Schema
class LoanApplicationResponse(LoanApplicationBase):
    id: int
    status: ApplicationStatus
    ml_prediction: Optional[str] = None
    ml_confidence: Optional[float] = None
    ml_risk_band: Optional[str] = None
    shap_values: Optional[dict] = None  # Expected to be parsed from JSON string if needed
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)

# 4. List View Schema (Dashboard)
class ApplicationListItem(BaseModel):
    id: int
    loan_amount: float
    purpose: Optional[str] = "Other"
    ml_prediction: Optional[str] = None
    ml_risk_band: Optional[str] = None
    status: ApplicationStatus
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
