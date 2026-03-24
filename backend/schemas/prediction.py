from pydantic import BaseModel, Field
from typing import Dict, Optional

# 1. Prediction Response (Result of ML model inference)
class PredictionResponse(BaseModel):
    prediction: str = Field(..., description="Approval prediction: 'Y' or 'N'")
    confidence: float = Field(..., ge=0.0, le=1.0)
    risk_band: str = Field(..., description="Risk category: Low / Medium / High / Very High")
    shap_values: Dict[str, float] = Field(..., description="Feature impact map (Feature name -> SHAP float)")
    model_version: str

# 2. What-If Request (For interactive simulator/what-if analysis)
class WhatIfRequest(BaseModel):
    applicant_income: float
    coapplicant_income: float = 0.0
    loan_amount: float
    loan_amount_term: int = 360
    credit_score: int = Field(..., ge=300, le=900)
    gender: str = "Male"
    married: bool = True
    dependents: int = 0
    education: str = "Graduate"
    self_employed: bool = False
    property_type: str = "Urban"
