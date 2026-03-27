from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import datetime
from typing import Optional, Dict, List, Any
import json
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

    @model_validator(mode="before")
    @classmethod
    def parse_shap_values(cls, data: Any) -> Any:
        # If data is an ORM object, extract its properties as a dict
        if hasattr(data, "shap_values") and isinstance(data.shap_values, str):
            setattr(data, "shap_values", json.loads(data.shap_values))
        elif isinstance(data, dict) and isinstance(data.get("shap_values"), str):
            data["shap_values"] = json.loads(data["shap_values"])
        return data

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

# 5. New Dataset Schema
class LoanApplicationCreateNew(BaseModel):
    monthly_income: float = Field(..., gt=0)
    monthly_expenses: float
    loan_amount: float = Field(..., gt=0)
    loan_tenure_months: int = Field(..., ge=12, le=360)
    credit_score: int = Field(..., ge=300, le=900)
    existing_loans_count: int = Field(0, ge=0, le=20)
    total_existing_emi: float = 0.0
    employment_type: str
    employment_years: int = Field(..., ge=0, le=50)
    late_payment_history: int = Field(0, ge=0, le=20)
    
    loan_purpose: str = "General"
    property_type: str = "Urban"
    property_area: str = ""

    @model_validator(mode='after')
    def check_employment_type(self):
        if self.employment_type not in ["salaried", "self-employed", "business"]:
            raise ValueError('employment_type must be salaried, self-employed, or business')
        return self
