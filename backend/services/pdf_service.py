import os
import json
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from backend.config import settings

# WeasyPrint requires libgobject-2.0-0 (only available on Linux).
# Make it optional so the server starts on Windows — PDF endpoint
# will return 503 if WeasyPrint is unavailable.
try:
    from weasyprint import HTML as WeasyHTML
    WEASYPRINT_AVAILABLE = True
except Exception:
    WeasyHTML = None
    WEASYPRINT_AVAILABLE = False


def get_plain_text(feature: str, value: float, application) -> str:
    """Returns a human-readable sentence for each feature."""
    if feature == "credit_score":
        score = application.credit_score if hasattr(application, 'credit_score') else "your"
        if value > 0:
            return f"Your credit score of {score} is strong"
        else:
            return f"Your credit score of {score} needs improvement"
    elif feature == "debt_to_income":
        if value > 0:
            return "Your debt-to-income ratio is manageable"
        else:
            return "Your debt-to-income ratio is too high"
    elif feature == "total_income":
        if value > 0:
            return "Your total household income is sufficient"
        else:
            return "Your total income is below our threshold"
    elif feature == "loan_amount":
        if value > 0:
            return "The requested loan amount is reasonable"
        else:
            return "The requested loan amount is too high"
    elif feature == "applicant_income":
        if value > 0:
            return "Your monthly income supports this loan"
        else:
            return "Your monthly income is insufficient"
    elif feature == "emi_estimate":
        if value > 0:
            return "The estimated EMI is affordable"
        else:
            return "The estimated EMI burden is too high"
    elif feature == "credit_score_band":
        if value > 0:
            return "Your credit band qualifies for this loan"
        else:
            return "Your credit band does not qualify"
    else:
        human_feature = feature.replace("_", " ").title()
        if value > 0:
            return f"Your {human_feature} profile is favorable"
        else:
            return f"Your {human_feature} profile is a concern"

def generate_decision_pdf(application, applicant_user, officer_user) -> str:
    """Generates the decision PDF and returns the file path."""
    
    # Load HTML template
    template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates')
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('decision_letter.html')
    
    # Build shap_factors list
    shap_factors = []
    if application.shap_values:
        shap_dict = {}
        if isinstance(application.shap_values, str):
            try:
                shap_dict = json.loads(application.shap_values)
            except Exception:
                pass
        elif isinstance(application.shap_values, dict):
            shap_dict = application.shap_values
            
        # Sort by absolute value descending
        sorted_factors = sorted(shap_dict.items(), key=lambda item: abs(item[1]), reverse=True)
        top_factors = sorted_factors[:3]
        
        for feature_name, shap_value in top_factors:
            shap_factors.append({
                "feature": feature_name,
                "value": shap_value,
                "direction": "positive" if shap_value > 0 else "negative",
                "plain_text": get_plain_text(feature_name, shap_value, application)
            })

    # Build context dict
    application_id_str = f"LS-{application.id:04d}"
    decision = "APPROVED" if application.officer_decision == "Y" else "REJECTED"
    decision_color = "#1A8A2E" if decision == "APPROVED" else "#CC2222"
    loan_amount_str = f"{application.loan_amount:,.0f}"
    
    if decision == "APPROVED":
        next_steps = "Our team will contact you within 3 business days to discuss disbursement arrangements. Please keep your documents ready."
    else:
        next_steps = "You may re-apply after 6 months once your financial profile has improved. We encourage you to focus on the key factors listed above. For further assistance contact us at support@loansense.com"
        
    context = {
        "applicant_name": applicant_user.full_name,
        "application_id": application_id_str,
        "decision": decision,
        "decision_color": decision_color,
        "loan_amount": loan_amount_str,
        "loan_purpose": application.purpose or "General",
        "date": datetime.utcnow().strftime("%d %B %Y"),
        "confidence": round((application.ml_confidence or 0) * 100),
        "risk_band": application.ml_risk_band or "Unknown",
        "shap_factors": shap_factors,
        "next_steps": next_steps,
        "officer_name": officer_user.full_name if officer_user else "Loan Review Committee"
    }

    # Render HTML
    html_content = template.render(**context)

    # Generate PDF
    if not WEASYPRINT_AVAILABLE:
        raise RuntimeError("PDF generation is not available on this platform (WeasyPrint requires libgobject-2.0-0).")
    os.makedirs(settings.PDF_OUTPUT_PATH, exist_ok=True)
    pdf_path = os.path.join(settings.PDF_OUTPUT_PATH, f"decision_{application.id}.pdf")
    
    WeasyHTML(string=html_content).write_pdf(pdf_path)

    return pdf_path
