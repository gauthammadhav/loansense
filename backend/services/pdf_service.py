from typing import Optional

def get_plain_text(feature_name: str, shap_value: float, data_value: Optional[float] = None) -> str:
    """
    Returns a plain English explanation for a given feature based on its impact.
    A positive shap_value means it contributed positively to the approval.
    A negative shap_value means it contributed negatively (towards rejection).
    """
    is_positive = shap_value >= 0

    if feature_name == "monthly_income":
        if is_positive:
            return f"Your monthly income of ₹{data_value:,.0f} supports this loan" if data_value else "Your monthly income supports this loan"
        else:
            return "Your monthly income needs improvement for this loan size"
            
    elif feature_name == "credit_score":
        if is_positive:
            return f"Your CIBIL score of {data_value} is strong" if data_value else "Your CIBIL score is strong"
        else:
            return f"Your CIBIL score of {data_value} needs improvement (aim for 700+)" if data_value else "Your CIBIL score needs improvement (aim for 700+)"
            
    elif feature_name == "debt_to_income":
        if is_positive:
            return "Your debt-to-income ratio is manageable"
        else:
            return "Your debt burden is too high (DTI above 0.5 is risky)"
            
    elif feature_name == "disposable_income":
        if is_positive:
            return f"You have sufficient disposable income of ₹{data_value:,.0f}/month" if data_value else "You have sufficient disposable income"
        else:
            return "Your disposable income after expenses and EMIs is too low"
            
    elif feature_name == "total_existing_emi":
        if is_positive:
            return "Your existing EMI obligations are within acceptable limits"
        else:
            return f"Your existing EMI of ₹{data_value:,.0f}/month is too high" if data_value else "Your existing EMI is too high"
            
    elif feature_name == "late_payment_history":
        if is_positive:
            return "You have a clean payment track record"
        else:
            return f"You have {data_value} late payment(s) on record — this is a concern" if data_value else "You have late payments on record — this is a concern"
            
    elif feature_name == "employment_years":
        if is_positive:
            return f"Your {data_value} years of employment shows strong stability" if data_value else "Your employment shows strong stability"
        else:
            return "Your employment tenure is below our minimum threshold"
            
    elif feature_name == "new_emi":
        if is_positive:
            return f"The proposed EMI of ₹{data_value:,.0f}/month is affordable" if data_value else "The proposed EMI is affordable"
        else:
            return f"The proposed EMI of ₹{data_value:,.0f}/month is too high for your income" if data_value else "The proposed EMI is too high for your income"
            
    elif feature_name == "employment_type":
        if is_positive:
            return "Your employment profile is favorable"
        else:
            return "Self-employed/business income carries higher risk"
            
    elif feature_name == "existing_loans_count":
        if is_positive:
            return "You have a manageable number of existing loans"
        else:
            return f"You have too many existing loans ({data_value})" if data_value else "You have too many existing loans"
            
    elif feature_name == "monthly_expenses":
        if is_positive:
            return "Your monthly expenses are well managed"
        else:
            return "Your monthly expenses are too high relative to income"
            
    else:
        # Fallback
        clean_name = str(feature_name).replace('_', ' ').title()
        if is_positive:
            return f"Your {clean_name} profile is favorable"
        else:
            return f"Your {clean_name} profile is a concern"
