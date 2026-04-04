from typing import List, Optional
from datetime import datetime, timezone, timedelta
import json
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from backend.database import get_db
from backend.models.user import User, UserRole
from backend.models.application import LoanApplication, ApplicationStatus
from backend.models.audit_log import AuditLog
from backend.schemas.officer import (
    OfficerDecisionRequest,
    ApplicationQueueItem,
    OfficerApplicationDetail,
    EscalateRequest
)
from backend.services.retraining_service import append_to_training_queue, maybe_retrain
from backend.middleware.auth_middleware import get_current_officer

router = APIRouter(prefix="/officer", tags=["Officer"])


# ── Helpers ────────────────────────────────────────────────────────────────────

def _waiting_hours(submitted_at: datetime) -> float:
    now = datetime.now(timezone.utc)
    sub = submitted_at
    if sub.tzinfo is None:
        sub = sub.replace(tzinfo=timezone.utc)
    return max(0.0, (now - sub).total_seconds() / 3600)


def _priority(hours: float) -> str:
    if hours > 24:
        return "high"
    if hours > 2:
        return "medium"
    return "low"


def _enrich(app: LoanApplication) -> dict:
    """Return a serialisation-ready dict with computed extra fields."""
    hours = _waiting_hours(app.submitted_at)
    pri   = _priority(hours)

    # Pull applicant_name from shap_values form_data if present
    applicant_name = "—"
    try:
        sv = json.loads(app.shap_values) if isinstance(app.shap_values, str) else (app.shap_values or {})
        applicant_name = sv.get("form_data", {}).get("applicant_name", "—")
    except Exception:
        pass

    return {
        "id":              app.id,
        "applicant_id":    app.applicant_id,
        "officer_id":      app.officer_id,
        "status":          app.status.value if hasattr(app.status, "value") else str(app.status),
        "loan_amount":     app.loan_amount,
        "loan_amount_term": app.loan_amount_term,
        "credit_score":    app.credit_score,
        "applicant_income": app.applicant_income,
        "ml_prediction":   app.ml_prediction,
        "ml_confidence":   app.ml_confidence,
        "ml_risk_band":    app.ml_risk_band,
        "purpose":         app.purpose,
        "submitted_at":    app.submitted_at.isoformat() if app.submitted_at else None,
        "decided_at":      app.decided_at.isoformat() if app.decided_at else None,
        "waiting_hours":   round(hours, 1),
        "sla_breached":    hours > 24,
        "priority":        pri,
        "applicant_name":  applicant_name,
        "gender":          app.gender,
        "married":         app.married,
        "self_employed":   app.self_employed,
        "education":       app.education,
        "officer_decision": app.officer_decision,
        "override_reason": app.override_reason,
    }


# ── Dashboard Stats ────────────────────────────────────────────────────────────

@router.get("/dashboard-stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """KPI snapshot for the officer dashboard header."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    all_apps = db.query(LoanApplication).all()

    pending_apps = [a for a in all_apps if a.status == ApplicationStatus.submitted]
    under_review_apps = [a for a in all_apps if a.status == ApplicationStatus.under_review]
    my_apps = [a for a in under_review_apps if a.officer_id == current_user.id]

    # SLA breached = pending > 24h
    sla_breached = [a for a in pending_apps if _waiting_hours(a.submitted_at) > 24]

    # Completed today
    def is_today(dt):
        if not dt: return False
        if dt.tzinfo is None: dt = dt.replace(tzinfo=timezone.utc)
        return dt >= today_start

    completed_today = [a for a in all_apps if a.status in (ApplicationStatus.approved, ApplicationStatus.rejected) and is_today(a.decided_at)]
    approved_today  = [a for a in completed_today if a.officer_decision == "Y"]

    # Avg decision time across all completed (hours → minutes)
    decision_times = []
    for a in all_apps:
        if a.decided_at and a.submitted_at:
            sub = a.submitted_at if a.submitted_at.tzinfo else a.submitted_at.replace(tzinfo=timezone.utc)
            dec = a.decided_at  if a.decided_at.tzinfo  else a.decided_at.replace(tzinfo=timezone.utc)
            decision_times.append((dec - sub).total_seconds() / 60)

    avg_decision_minutes = round(sum(decision_times) / len(decision_times), 1) if decision_times else 0

    # Last 7 days trends
    daily_trends = []
    for d in range(6, -1, -1):
        day_start = (now - timedelta(days=d)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end   = day_start + timedelta(days=1)
        approved_n = sum(
            1 for a in all_apps
            if a.status == ApplicationStatus.approved and a.decided_at
            and (a.decided_at.replace(tzinfo=timezone.utc) if not a.decided_at.tzinfo else a.decided_at) >= day_start
            and (a.decided_at.replace(tzinfo=timezone.utc) if not a.decided_at.tzinfo else a.decided_at) < day_end
        )
        rejected_n = sum(
            1 for a in all_apps
            if a.status == ApplicationStatus.rejected and a.decided_at
            and (a.decided_at.replace(tzinfo=timezone.utc) if not a.decided_at.tzinfo else a.decided_at) >= day_start
            and (a.decided_at.replace(tzinfo=timezone.utc) if not a.decided_at.tzinfo else a.decided_at) < day_end
        )
        daily_trends.append({
            "date": day_start.strftime("%b %d"),
            "approved": approved_n,
            "rejected": rejected_n,
        })

    # Risk distribution in pending queue
    risk_counts = {"Low": 0, "Medium": 0, "High": 0, "Very High": 0}
    for a in pending_apps + under_review_apps:
        band = a.ml_risk_band or "Unknown"
        risk_counts[band] = risk_counts.get(band, 0) + 1

    return {
        "pending_count":            len(pending_apps),
        "under_review_count":       len(under_review_apps),
        "assigned_to_me":           len(my_apps),
        "completed_today":          len(completed_today),
        "approval_rate_today":      round(len(approved_today) / len(completed_today) * 100, 1) if completed_today else 0,
        "sla_breached_count":       len(sla_breached),
        "avg_decision_minutes":     avg_decision_minutes,
        "daily_trends":             daily_trends,
        "risk_distribution":        risk_counts,
        "total_applications":       len(all_apps),
    }


# ── Queue Endpoints ────────────────────────────────────────────────────────────

@router.get("/queue")
def get_decision_queue(
    status_filter: str = "pending",   # pending | under_review | my_queue | all
    sort_by: str = "oldest",          # oldest | newest | amount | risk | confidence
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """
    Paginated application queue with filtering and sorting.
    Default: FIFO (oldest pending first).
    """
    query = db.query(LoanApplication)

    if status_filter == "pending":
        query = query.filter(LoanApplication.status == ApplicationStatus.submitted)
    elif status_filter == "under_review":
        query = query.filter(LoanApplication.status == ApplicationStatus.under_review)
    elif status_filter == "my_queue":
        query = query.filter(
            LoanApplication.status == ApplicationStatus.under_review,
            LoanApplication.officer_id == current_user.id
        )
    elif status_filter == "sla_breach":
        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        query = query.filter(
            LoanApplication.status == ApplicationStatus.submitted,
            LoanApplication.submitted_at <= cutoff
        )
    # "all" = no filter

    # Sorting
    if sort_by == "newest":
        query = query.order_by(LoanApplication.submitted_at.desc())
    elif sort_by == "amount":
        query = query.order_by(LoanApplication.loan_amount.desc())
    elif sort_by == "risk":
        # Sort by confidence ascending (most risky first)
        query = query.order_by(LoanApplication.ml_confidence.asc())
    elif sort_by == "confidence":
        query = query.order_by(LoanApplication.ml_confidence.asc())
    else:
        # Default FIFO
        query = query.order_by(LoanApplication.submitted_at.asc())

    apps = query.all()
    return [_enrich(a) for a in apps]


@router.get("/my-queue")
def get_my_queue(
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Returns only applications assigned to the current officer."""
    apps = db.query(LoanApplication).filter(
        LoanApplication.status == ApplicationStatus.under_review,
        LoanApplication.officer_id == current_user.id
    ).order_by(LoanApplication.submitted_at.asc()).all()
    return [_enrich(a) for a in apps]


# ── Assignment ─────────────────────────────────────────────────────────────────

@router.post("/assign/{application_id}")
def assign_application(
    application_id: int,
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Claims an application for review."""
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.officer_id = current_user.id
    app.status = ApplicationStatus.under_review
    db.commit()
    db.refresh(app)

    audit = AuditLog(
        application_id=app.id,
        actor_id=current_user.id,
        action="officer_assigned",
        detail=json.dumps({"officer": current_user.email})
    )
    db.add(audit)
    db.commit()

    return _enrich(app)


@router.post("/bulk-assign")
def bulk_assign_applications(
    payload: dict,
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    """Assign multiple applications at once to current officer."""
    ids = payload.get("application_ids", [])
    if not ids:
        raise HTTPException(status_code=400, detail="No application IDs provided")

    apps = db.query(LoanApplication).filter(LoanApplication.id.in_(ids)).all()
    for app in apps:
        if app.status == ApplicationStatus.submitted:
            app.officer_id = current_user.id
            app.status = ApplicationStatus.under_review
            audit = AuditLog(
                application_id=app.id,
                actor_id=current_user.id,
                action="bulk_assigned",
                detail=json.dumps({"officer": current_user.email})
            )
            db.add(audit)

    db.commit()
    return {"assigned": len(apps), "officer_id": current_user.id}


# ── Decision ───────────────────────────────────────────────────────────────────

@router.post("/decide/{application_id}")
def make_decision(
    application_id: int,
    request: OfficerDecisionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.officer_decision = request.decision
    app.override_reason  = request.override_reason
    app.decided_at       = datetime.now(timezone.utc)
    app.officer_id       = current_user.id
    app.status           = ApplicationStatus.approved if request.decision == "Y" else ApplicationStatus.rejected
    app.fed_to_training  = False
    db.commit()

    audit = AuditLog(
        application_id=app.id,
        actor_id=current_user.id,
        action=f"officer_{app.status.value}",
        detail=json.dumps({
            "decision": request.decision,
            "override_reason": request.override_reason,
            "ml_prediction": app.ml_prediction,
        })
    )
    db.add(audit)

    app_fields = {
        "gender": app.gender, "married": app.married,
        "dependents": app.dependents, "education": app.education,
        "self_employed": app.self_employed, "applicant_income": app.applicant_income,
        "coapplicant_income": app.coapplicant_income, "loan_amount": app.loan_amount,
        "loan_amount_term": app.loan_amount_term, "credit_score": app.credit_score,
        "property_type": app.property_type,
    }
    queue_size = append_to_training_queue(app_fields, request.decision)
    app.fed_to_training = True
    db.commit()

    background_tasks.add_task(maybe_retrain)

    return {
        "status": "decision_saved",
        "application_id": app.id,
        "final_status": app.status.value,
        "queue_size": queue_size,
    }


# ── Escalate ───────────────────────────────────────────────────────────────────

@router.post("/escalate/{application_id}")
def escalate_application(
    application_id: int,
    request: EscalateRequest,
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = ApplicationStatus.escalated
    db.commit()

    audit = AuditLog(
        application_id=app.id,
        actor_id=current_user.id,
        action="escalated",
        detail=json.dumps({"reason": request.reason})
    )
    db.add(audit)
    db.commit()
    db.refresh(app)
    return _enrich(app)


# ── All Applications (Officer view) ───────────────────────────────────────────

@router.get("/applications")
def list_all_applications(
    status_filter: Optional[str] = None,
    risk_filter: Optional[str] = None,
    current_user: User = Depends(get_current_officer),
    db: Session = Depends(get_db)
):
    query = db.query(LoanApplication)
    if status_filter:
        query = query.filter(LoanApplication.status == status_filter)
    if risk_filter:
        query = query.filter(LoanApplication.ml_risk_band == risk_filter)
    apps = query.order_by(LoanApplication.submitted_at.desc()).all()
    return [_enrich(a) for a in apps]
