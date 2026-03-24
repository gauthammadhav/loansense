from fastapi import APIRouter, Depends
from backend.services.prediction_service import run_prediction
from backend.schemas.prediction import PredictionResponse, WhatIfRequest
from backend.middleware.auth_middleware import get_current_applicant

# 1. API Route Configuration
router = APIRouter(prefix="/predict", tags=["Predictions"])

@router.post("/whatif", response_model=PredictionResponse)
def run_what_if_analysis(
    whatif_in: WhatIfRequest, 
    _ = Depends(get_current_applicant)
):
    """
    Authenticated simulator to run 'What-If' scenarios.
    Allows applicants to test how financial changes (e.g., higher income) 
    impact their approval odds without submitting a formal application.
    """
    # 1. Convert input schema to the service-compatible dictionary
    # 2. Run the prediction (includes full SHAP impact analysis)
    result = run_prediction(whatif_in.model_dump())
    
    # 3. Return the detailed prediction response
    return result

@router.post("/eligibility-check")
def run_pre_check(whatif_in: WhatIfRequest):
    """
    Public lite endpoint for quick eligibility checks.
    Does not require authentication and omits complex SHAP values.
    """
    # 1. Run the detailed prediction
    result = run_prediction(whatif_in.model_dump())
    
    # 2. Extract and return only the high-level decision/risk data
    return {
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "risk_band": result["risk_band"]
    }
