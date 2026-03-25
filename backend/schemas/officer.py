from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import datetime
from typing import Optional, Literal, Dict, Any
import json

class OfficerDecisionRequest(BaseModel):
    decision: Literal["Y", "N"] = Field(..., description="Y for Approve, N for Reject")
    override_reason: str = ""

class ApplicationQueueItem(BaseModel):
    id: int
    applicant_id: int
    loan_amount: float
    purpose: Optional[str] = "Other"
    ml_prediction: Optional[str] = None
    ml_confidence: Optional[float] = None
    ml_risk_band: Optional[str] = None
    status: str
    submitted_at: datetime
    days_pending: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class OfficerApplicationDetail(BaseModel):
    id: int
    status: str
    gender: str
    married: bool
    dependents: int
    education: str
    self_employed: bool
    applicant_income: float
    coapplicant_income: float
    loan_amount: float
    loan_amount_term: int
    credit_score: int
    property_type: str
    property_area: Optional[str] = None
    purpose: Optional[str] = "Other"
    ml_prediction: Optional[str] = None
    ml_confidence: Optional[float] = None
    ml_risk_band: Optional[str] = None
    shap_values: Optional[dict] = None
    officer_id: Optional[int] = None
    officer_decision: Optional[str] = None
    override_reason: Optional[str] = None
    submitted_at: datetime
    decided_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def parse_shap_values(cls, data: Any) -> Any:
        # Auto-parse JSON string from SQLAlchemy model back to dictionary
        if hasattr(data, "shap_values") and isinstance(data.shap_values, str):
            setattr(data, "shap_values", json.loads(data.shap_values))
        elif isinstance(data, dict) and isinstance(data.get("shap_values"), str):
            data["shap_values"] = json.loads(data["shap_values"])
        return data

class EscalateRequest(BaseModel):
    reason: str
