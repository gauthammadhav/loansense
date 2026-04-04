"""
backend/services/document_service.py

Document upload, text extraction, data parsing, trust scoring, risk assessment.

OCR Priority:
  1. PyPDF2 native text layer (works for most digital/generated PDFs)
  2. pytesseract + Pillow (requires tesseract binary — optional on Windows)
  3. Graceful fallback returns empty dict with 0 confidence if both fail
"""
from __future__ import annotations

import io
import json
import os
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from backend.database import SessionLocal
from backend.models.application import LoanApplication
from backend.models.document import DocumentUpload


# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

UPLOAD_BASE = "uploads/documents"
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 10 * 1024 * 1024   # 10 MB


DOC_TYPES = {
    "bank_statement":  {"label": "Bank Statement",         "fields": ["monthly_income", "monthly_expenses"]},
    "salary_slip":     {"label": "Salary Slip",            "fields": ["monthly_income"]},
    "credit_report":   {"label": "CIBIL / Credit Report",  "fields": ["credit_score", "existing_loans_count", "total_existing_emi", "late_payment_history"]},
    "loan_statement":  {"label": "Loan Statement",         "fields": ["total_existing_emi", "existing_loans_count"]},
}


# ─────────────────────────────────────────────────────────────────────────────
# Helpers — safe JSON encode / decode
# ─────────────────────────────────────────────────────────────────────────────

def _jdump(obj) -> str:
    return json.dumps(obj, default=str)

def _jload(s: Optional[str]) -> dict | list:
    if not s:
        return {}
    try:
        return json.loads(s)
    except Exception:
        return {}


# ─────────────────────────────────────────────────────────────────────────────
# Text extraction
# ─────────────────────────────────────────────────────────────────────────────

def _extract_pdf_native(file_bytes: bytes) -> Tuple[str, float]:
    """Try PyPDF2 native text layer first."""
    try:
        import PyPDF2  # type: ignore
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n".join(pages)
        if len(text.strip()) > 100:
            return text, 0.92
        return text, 0.30   # Short → likely a scanned PDF
    except Exception as e:
        print(f"[doc_service] PyPDF2 failed: {e}")
        return "", 0.0


def _extract_image_tesseract(file_bytes: bytes) -> Tuple[str, float]:
    """Fallback: Tesseract OCR (requires tesseract binary)."""
    try:
        import pytesseract          # type: ignore
        from PIL import Image, ImageEnhance  # type: ignore

        img = Image.open(io.BytesIO(file_bytes)).convert("L")
        img = ImageEnhance.Contrast(img).enhance(2)
        text = pytesseract.image_to_string(img, config="--oem 3 --psm 6")
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        confs = [int(c) for c in data["conf"] if str(c) != "-1"]
        avg_conf = sum(confs) / len(confs) / 100 if confs else 0.0
        return text, avg_conf
    except Exception as e:
        print(f"[doc_service] Tesseract OCR failed (not installed?): {e}")
        return "", 0.0


def _extract_pdf_ocr(file_bytes: bytes) -> Tuple[str, float]:
    """Convert each PDF page to image then OCR (requires pdf2image + poppler)."""
    try:
        from pdf2image import convert_from_bytes  # type: ignore
        images = convert_from_bytes(file_bytes, dpi=200)
        texts = []
        for img_pil in images:
            buf = io.BytesIO()
            img_pil.save(buf, format="PNG")
            t, _ = _extract_image_tesseract(buf.getvalue())
            texts.append(t)
        return "\n".join(texts), 0.70
    except Exception as e:
        print(f"[doc_service] pdf2image/OCR failed: {e}")
        return "", 0.0


def extract_text(file_bytes: bytes, filename: str) -> Tuple[str, float, str]:
    """
    Dispatch to the best available extractor.
    Returns (text, confidence, method_label).
    """
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf":
        text, conf = _extract_pdf_native(file_bytes)
        if conf >= 0.5:
            return text, conf, "text_layer"
        # Try OCR fallback for scanned PDFs
        text2, conf2 = _extract_pdf_ocr(file_bytes)
        if conf2 > conf:
            return text2, conf2, "tesseract_pdf"
        return text, conf, "text_layer_partial"

    # Image → direct tesseract
    text, conf = _extract_image_tesseract(file_bytes)
    if conf > 0:
        return text, conf, "tesseract"

    return "", 0.0, "failed"


# ─────────────────────────────────────────────────────────────────────────────
# Parsers
# ─────────────────────────────────────────────────────────────────────────────

def _amounts(text: str) -> List[float]:
    """Extract all numeric amounts from text (handles commas, ₹ prefix)."""
    raw = re.findall(r"₹?\s*([1-9][0-9,]{2,})", text)
    return [float(r.replace(",", "")) for r in raw if r]


def _first_amount(pattern: str, text: str) -> Optional[float]:
    m = re.search(pattern, text, re.IGNORECASE)
    if m:
        try:
            return float(m.group(1).replace(",", ""))
        except Exception:
            pass
    return None


def parse_bank_statement(text: str) -> Dict:
    low = text.lower()

    # Credits (likely salary / income)
    credit_pattern = r"(?:credit|cr|deposit)[^\n]*?([1-9][0-9,]{3,})"
    credits = [float(m.replace(",", "")) for m in re.findall(credit_pattern, low)]
    salary_credits = sorted([c for c in credits if c >= 5000], reverse=True)[:6]

    # Debits
    debit_pattern = r"(?:debit|dr|withdraw)[^\n]*?([1-9][0-9,]{3,})"
    debits = [float(m.replace(",", "")) for m in re.findall(debit_pattern, low)]

    # Balance
    bal_pattern = r"(?:closing|available|balance)[^\n]*?([1-9][0-9,]{3,})"
    balances = [float(m.replace(",", "")) for m in re.findall(bal_pattern, low)]

    # Bounces
    bounce_count = sum(1 for kw in ["nsf", "insufficient", "bounced", "returned", "dishonour"] if kw in low)

    detected_income = int(sum(salary_credits) / len(salary_credits)) if salary_credits else 0
    detected_expenses = int(sum(debits) / max(3, len(debits) / 20)) if debits else 0

    return {
        "detected_income":   detected_income,
        "detected_expenses": detected_expenses,
        "average_balance":   int(sum(balances) / len(balances)) if balances else 0,
        "salary_credits":    [int(c) for c in salary_credits[:3]],
        "bounce_count":      bounce_count,
        "total_debits":      int(sum(debits)),
    }


def parse_salary_slip(text: str) -> Dict:
    low = text.lower()

    gross  = _first_amount(r"gross[^\n]*?([1-9][0-9,]{3,})", low) or 0
    net    = _first_amount(r"net[^\n]*?([1-9][0-9,]{3,})", low) or 0
    basic  = _first_amount(r"basic[^\n]*?([1-9][0-9,]{3,})", low) or 0

    employer_m = re.search(r"(?:employer|company|organisation)[:\s]+([A-Za-z\s&]+)", text, re.IGNORECASE)
    employer = employer_m.group(1).strip()[:50] if employer_m else "Unknown"

    return {
        "gross_salary":    int(gross),
        "net_salary":      int(net) or int(basic),
        "deductions":      int(max(0, gross - net)),
        "employer_name":   employer,
        "employment_type": "salaried",
    }


def parse_credit_report(text: str) -> Dict:
    low = text.lower()

    # CIBIL / credit score
    score_m = re.search(r"(?:cibil|credit)\s*score[:\s]*([3-8][0-9]{2})", low)
    if not score_m:
        score_m = re.search(r"\b([3-8][0-9]{2})\b", text)   # generic 3-digit
    credit_score = int(score_m.group(1)) if score_m else 0

    # Loan keywords
    loan_kws = ["personal loan", "home loan", "car loan", "auto loan", "credit card", "two wheeler"]
    loan_count = sum(1 for kw in loan_kws if kw in low)

    # EMIs
    emis = [float(m.replace(",", "")) for m in re.findall(r"emi[:\s]*₹?\s*([1-9][0-9,]{2,})", low)]
    total_emi = sum(emis)

    # Late payments
    late_count = sum(1 for kw in ["overdue", "late payment", "dpd", "delinquent", "default"] if kw in low)

    # Utilisation
    util_m = re.search(r"utiliz[^\d]*([0-9.]+)\s*%", low)
    utilization = float(util_m.group(1)) if util_m else 0.0

    return {
        "credit_score":          credit_score,
        "existing_loans_count":  min(loan_count, 10),
        "total_emi_obligation":  int(total_emi),
        "late_payment_count":    late_count,
        "credit_utilization":    round(utilization, 1),
    }


def parse_loan_statement(text: str) -> Dict:
    low = text.lower()
    emi = _first_amount(r"(?:emi|monthly installment)[^\n]*?([1-9][0-9,]{2,})", low) or 0
    outstanding = _first_amount(r"(?:outstanding|principal)[^\n]*?([1-9][0-9,]{3,})", low) or 0
    return {
        "emi_amount":    int(emi),
        "outstanding":  int(outstanding),
    }


PARSERS = {
    "bank_statement": parse_bank_statement,
    "salary_slip":    parse_salary_slip,
    "credit_report":  parse_credit_report,
    "loan_statement": parse_loan_statement,
}


# ─────────────────────────────────────────────────────────────────────────────
# Verification
# ─────────────────────────────────────────────────────────────────────────────

def _pct_variance(a: float, b: float) -> float:
    if a == 0 and b == 0:
        return 0.0
    base = max(abs(a), abs(b), 1)
    return abs(a - b) / base * 100


def verify_data(extracted: Dict, app: LoanApplication, doc_type: str) -> Tuple[float, List[Dict]]:
    """
    Compare extracted values against user-entered application fields.
    Returns (trust_score 0–100, discrepancies list).
    """
    discrepancies: List[Dict] = []
    checks_passed = 0
    checks_total  = 0

    def check(field, user_val, doc_val, tolerance_pct=15, point_tolerance=None):
        nonlocal checks_total, checks_passed
        if doc_val is None or doc_val == 0:
            return
        checks_total += 1
        if point_tolerance is not None:
            variance = abs(float(user_val or 0) - float(doc_val))
            ok = variance <= point_tolerance
        else:
            variance = _pct_variance(float(user_val or 0), float(doc_val))
            ok = variance <= tolerance_pct
        if ok:
            checks_passed += 1
        else:
            severity = "high" if variance > 40 else "medium" if variance > 20 else "low"
            discrepancies.append({
                "field":           field,
                "user_entered":    user_val,
                "document_shows":  doc_val,
                "variance":        round(variance, 1),
                "variance_type":   "points" if point_tolerance else "percent",
                "severity":        severity,
            })

    # Retrieve shap form_data for new-format applications
    form = {}
    try:
        raw = json.loads(app.shap_values) if app.shap_values else {}
        form = raw.get("form_data", {})
    except Exception:
        pass

    monthly_income   = form.get("monthly_income")   or app.applicant_income
    monthly_expenses = form.get("monthly_expenses")  or 0
    credit_score     = form.get("credit_score")      or app.credit_score
    existing_loans   = form.get("existing_loans_count", app.existing_loans_count if hasattr(app, "existing_loans_count") else None)
    total_emi        = form.get("total_existing_emi") or 0
    late_pmts        = form.get("late_payment_history") or 0

    if doc_type == "bank_statement":
        check("monthly_income",   monthly_income,   extracted.get("detected_income"),   tolerance_pct=15)
        check("monthly_expenses", monthly_expenses, extracted.get("detected_expenses"),  tolerance_pct=25)

    elif doc_type == "salary_slip":
        check("monthly_income",   monthly_income,   extracted.get("net_salary"),        tolerance_pct=12)

    elif doc_type == "credit_report":
        check("credit_score",          credit_score,  extracted.get("credit_score"),         point_tolerance=30)
        check("existing_loans_count",  existing_loans, extracted.get("existing_loans_count"), point_tolerance=1)
        check("total_existing_emi",    total_emi,      extracted.get("total_emi_obligation"),  tolerance_pct=20)
        check("late_payment_history",  late_pmts,      extracted.get("late_payment_count"),    point_tolerance=2)

    elif doc_type == "loan_statement":
        check("total_existing_emi",    total_emi,      extracted.get("emi_amount"),  tolerance_pct=20)

    trust_score = (checks_passed / checks_total * 100) if checks_total > 0 else 50.0  # Neutral if no checks
    return round(trust_score, 1), discrepancies


# ─────────────────────────────────────────────────────────────────────────────
# Risk Assessment
# ─────────────────────────────────────────────────────────────────────────────

def assess_risk(extracted: Dict, doc_type: str, raw_text: str) -> Tuple[float, List[str]]:
    risk_score = 0.0
    flags: List[str] = []

    text_low = raw_text.lower()

    if doc_type == "bank_statement":
        bounces = extracted.get("bounce_count", 0)
        if bounces > 0:
            risk_score += min(25, bounces * 10)
            flags.append(f"{bounces} bounced / returned transaction(s) detected")
        avg_bal = extracted.get("average_balance", 0)
        if 0 < avg_bal < 5000:
            risk_score += 15
            flags.append("Low average bank balance (< ₹5,000)")
        salaries = extracted.get("salary_credits", [])
        if len(salaries) >= 2:
            avg = sum(salaries) / len(salaries)
            volatility = max(abs(s - avg) / avg * 100 for s in salaries) if avg else 0
            if volatility > 35:
                risk_score += 10
                flags.append(f"High income volatility ({volatility:.0f}%)")

    elif doc_type == "credit_report":
        score = extracted.get("credit_score", 900)
        if 0 < score < 650:
            risk_score += 25
            flags.append(f"Credit score below safe threshold ({score})")
        late = extracted.get("late_payment_count", 0)
        if late >= 3:
            risk_score += 20
            flags.append(f"{late} late payment instance(s) on record")
        util = extracted.get("credit_utilization", 0)
        if util > 70:
            risk_score += 15
            flags.append(f"High credit utilization ({util:.0f}%)")

    # Generic red-flag keywords
    for kw in ["fraud", "legal notice", "bankruptcy", "default", "seizure", "cheque bounce"]:
        if kw in text_low:
            risk_score += 30
            flags.append(f"High-risk keyword detected: '{kw}'")
            break

    return round(min(risk_score, 100), 1), flags


# ─────────────────────────────────────────────────────────────────────────────
# Application verification update
# ─────────────────────────────────────────────────────────────────────────────

def update_application_verification(db: Session, app: LoanApplication, doc: DocumentUpload):
    """Recompute overall trust score and confidence boost on parent application."""
    app.documents_uploaded = True

    all_docs = db.query(DocumentUpload).filter(
        DocumentUpload.application_id == app.id
    ).all()

    if not all_docs:
        return

    avg_trust = sum(d.trust_score for d in all_docs) / len(all_docs)
    app.overall_trust_score = round(avg_trust, 1)

    if avg_trust >= 80:
        app.document_verification_status = "complete"
    elif avg_trust >= 50:
        app.document_verification_status = "partial"
    else:
        app.document_verification_status = "failed"

    # Update verified fields from specific doc types
    extracted = _jload(doc.extracted_data)
    if doc.document_type == "bank_statement" and extracted.get("detected_income"):
        app.verified_income = extracted["detected_income"]
    if doc.document_type == "credit_report" and extracted.get("credit_score"):
        app.verified_credit_score = extracted["credit_score"]
    if doc.document_type == "salary_slip" and extracted.get("net_salary"):
        app.verified_income = extracted["net_salary"]

    # Confidence boost: 0–0.15 linearly mapping 50–100 trust
    if avg_trust >= 50:
        boost = round(0.15 * (avg_trust - 50) / 50, 4)
        # Avoid double-boosting on re-upload
        old_boost = app.verification_boost or 0.0
        net_boost = boost - old_boost
        
        app.verification_boost = boost
        if app.ml_confidence is not None:
            new_conf = min(app.ml_confidence + net_boost, 0.99)
            app.ml_confidence = new_conf
            app.ml_prediction = "Y" if new_conf >= 0.5 else "N"
            
            # Recalculate risk band
            if new_conf >= 0.80:
                app.ml_risk_band = "Low"
            elif new_conf >= 0.60:
                app.ml_risk_band = "Medium"
            elif new_conf >= 0.40:
                app.ml_risk_band = "High"
            else:
                app.ml_risk_band = "Very High"
    else:
        # Apply strict penalty for fraudulent/unverified documents (0 to -0.25)
        # Revert any previous positive boost first
        old_boost = app.verification_boost or 0.0
        
        # Calculate new penalty mapping 0-49 trust mapped to -0.25 -> 0.0
        penalty = round(-0.25 * (50 - avg_trust) / 50, 4)
        net_change = penalty - old_boost
        
        app.verification_boost = penalty
        if app.ml_confidence is not None:
            new_conf = max(app.ml_confidence + net_change, 0.01)
            app.ml_confidence = new_conf
            app.ml_prediction = "Y" if new_conf >= 0.5 else "N"
            
            # Recalculate risk band downward
            if new_conf >= 0.80:
                app.ml_risk_band = "Low"
            elif new_conf >= 0.60:
                app.ml_risk_band = "Medium"
            elif new_conf >= 0.40:
                app.ml_risk_band = "High"
            else:
                app.ml_risk_band = "Very High"


# ─────────────────────────────────────────────────────────────────────────────
# Main Processor
# ─────────────────────────────────────────────────────────────────────────────

class DocumentProcessor:
    """Orchestrates the full document processing pipeline."""

    def __init__(self, db: Session):
        self.db = db
        os.makedirs(UPLOAD_BASE, exist_ok=True)

    def _save_file(self, application_id: int, file_bytes: bytes, filename: str) -> str:
        folder = os.path.join(UPLOAD_BASE, str(application_id))
        os.makedirs(folder, exist_ok=True)
        safe_name = re.sub(r"[^\w.\-]", "_", filename)
        path = os.path.join(folder, safe_name)
        # If file already exists, add timestamp suffix
        if os.path.exists(path):
            base, ext = os.path.splitext(safe_name)
            path = os.path.join(folder, f"{base}_{int(time.time())}{ext}")
        with open(path, "wb") as f:
            f.write(file_bytes)
        return path

    def process_document(
        self,
        application_id: int,
        file_bytes: bytes,
        filename: str,
        document_type: str,
    ) -> Dict:
        t0 = time.time()

        # 1. Save file
        file_path = self._save_file(application_id, file_bytes, filename)

        # 2. Extract text
        raw_text, ocr_conf, method = extract_text(file_bytes, filename)

        # 3. Parse by document type
        parser = PARSERS.get(document_type)
        extracted = parser(raw_text) if (parser and raw_text) else {}

        # 4. Get application
        app = self.db.query(LoanApplication).filter(
            LoanApplication.id == application_id
        ).first()
        if not app:
            raise ValueError(f"Application {application_id} not found")

        # 5. Verify
        trust_score, discrepancies = verify_data(extracted, app, document_type)

        # 6. Risk assessment
        risk_score, risk_flags = assess_risk(extracted, document_type, raw_text)

        # 7. Status label
        if trust_score >= 75:
            v_status = "verified"
        elif trust_score >= 45:
            v_status = "partial"
        elif ocr_conf < 0.2:
            v_status = "failed"
        else:
            v_status = "mismatch"

        # 8. Save record
        doc_record = DocumentUpload(
            application_id=application_id,
            document_type=document_type,
            file_path=file_path,
            original_filename=filename,
            extracted_data=_jdump(extracted),
            discrepancies=_jdump(discrepancies),
            risk_flags=_jdump(risk_flags),
            verification_status=v_status,
            trust_score=trust_score,
            document_risk_score=risk_score,
            ocr_confidence=round(ocr_conf, 3),
            processing_time_sec=round(time.time() - t0, 2),
            processed_at=datetime.now(timezone.utc),
            processed_by=method,
        )
        self.db.add(doc_record)
        self.db.flush()   # Get the ID before commit

        # 9. Update application
        update_application_verification(self.db, app, doc_record)
        self.db.commit()
        self.db.refresh(doc_record)

        return {
            "success":        True,
            "document_id":    doc_record.id,
            "document_type":  document_type,
            "extracted_data": extracted,
            "trust_score":    trust_score,
            "discrepancies":  discrepancies,
            "risk_flags":     risk_flags,
            "ocr_confidence": round(ocr_conf, 3),
            "verification_status": v_status,
            # Application-level updates
            "overall_trust_score": app.overall_trust_score,
            "verification_boost":  app.verification_boost,
        }
