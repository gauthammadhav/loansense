"""
seed_applications.py
Run from the project root:
    python -m backend.seed_applications
Generates 25 realistic loan applications with varied statuses,
ML predictions (via the real model), and timestamped submission times.
"""
# suppress passlib version warning
import warnings
warnings.filterwarnings('ignore')
import sys, os, json, random
from datetime import datetime, timedelta, timezone

# Ensure project root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine, Base
from backend.models.application import LoanApplication, ApplicationStatus
from backend.models.user import User, UserRole
from backend.services.prediction_service import run_prediction_new
from backend.services.auth_service import hash_password
from ml.new_preprocess import compute_derived_features

# ── Seed Data ─────────────────────────────────────────────────────────────────

INDIAN_NAMES = [
    "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Gupta",
    "Vikram Singh", "Anita Reddy", "Suresh Nair", "Meera Iyer",
    "Arjun Verma", "Kavita Mehta", "Sanjay Desai", "Pooja Joshi",
    "Rahul Kapoor", "Neha Agarwal", "Karan Malhotra", "Divya Rao",
    "Rohan Bansal", "Simran Kaur", "Manish Pandey", "Ritu Shah",
    "Deepak Nambiar", "Asha Bhat", "Lokesh Yadav", "Sunita Tiwari",
    "Praveen Menon",
]

INCOMES      = [30000, 45000, 60000, 75000, 100000, 150000, 200000, 300000]
LOAN_AMOUNTS = [100000, 200000, 500000, 750000, 1000000, 1500000, 2500000, 5000000]
TENURES      = [12, 24, 36, 48, 60, 84, 120, 180, 240]
EMP_TYPES    = ["salaried", "self-employed", "business"]
LOAN_PURPOSES = ["Home Purchase", "Home Construction", "Vehicle", "Education",
                 "Business", "Personal", "Medical", "Other"]

# Status distribution: 40% pending, 30% under_review, 20% approved, 10% rejected
STATUS_DIST = (
    [ApplicationStatus.submitted]   * 10 +
    [ApplicationStatus.under_review] * 7  +
    [ApplicationStatus.approved]    * 6  +
    [ApplicationStatus.rejected]    * 2
)


def rand_submitted_at(status: ApplicationStatus) -> datetime:
    """Generate a realistic submission time based on status."""
    now = datetime.now(timezone.utc)
    if status == ApplicationStatus.submitted:
        # Pending: 1 hour – 72 hours ago (mix of normal / SLA-breach)
        hours_ago = random.choice([1, 3, 6, 10, 14, 18, 26, 30, 48, 60, 72])
    elif status == ApplicationStatus.under_review:
        hours_ago = random.randint(4, 48)
    else:
        # Approved/rejected: 2–30 days ago
        hours_ago = random.randint(48, 720)
    return now - timedelta(hours=hours_ago)


def get_or_create_officer(db) -> User:
    officer = db.query(User).filter(User.role == UserRole.officer).first()
    if officer:
        return officer
    officer = User(
        email="officer@loansense.in",
        hashed_password=hash_password("officer123"),
        full_name="LoanSense Officer",
        role=UserRole.officer,
        is_active=True,
    )
    db.add(officer)
    db.commit()
    db.refresh(officer)
    print(f"  ✅ Created officer user: {officer.email} / officer123")
    return officer


def get_or_create_seeder_applicant(db) -> User:
    """A single dummy applicant tied to all seeded records."""
    email = "seed.applicant@loansense.in"
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        email=email,
        hashed_password=hash_password("seed123"),
        full_name="Seed Applicant",
        role=UserRole.applicant,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def build_app_data(name: str) -> dict:
    income   = random.choice(INCOMES)
    expenses = int(income * random.uniform(0.35, 0.65))
    return {
        "applicant_name": name,
        "monthly_income": income,
        "monthly_expenses": expenses,
        "loan_amount": random.choice(LOAN_AMOUNTS),
        "loan_tenure_months": random.choice(TENURES),
        "credit_score": random.randint(350, 870),
        "existing_loans_count": random.randint(0, 4),
        "total_existing_emi": random.choice([0, 0, 3000, 6000, 10000, 15000, 20000]),
        "employment_type": random.choice(EMP_TYPES),
        "employment_years": random.randint(1, 22),
        "late_payment_history": random.choice([0, 0, 0, 1, 1, 2, 3, 4]),
        "loan_purpose": random.choice(LOAN_PURPOSES),
        "property_type": "Urban",
        "property_area": "",
    }


def seed(clear_existing: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if clear_existing:
            deleted = db.query(LoanApplication).filter(
                LoanApplication.applicant_id == db.query(User).filter(
                    User.email == "seed.applicant@loansense.in"
                ).first().id if db.query(User).filter(
                    User.email == "seed.applicant@loansense.in"
                ).first() else -1
            ).delete()
            db.commit()
            print(f"  🗑  Cleared {deleted} existing seed applications")

        officer  = get_or_create_officer(db)
        applicant = get_or_create_seeder_applicant(db)

        names = INDIAN_NAMES.copy()
        random.shuffle(names)
        statuses = STATUS_DIST.copy()
        random.shuffle(statuses)

        created = 0
        for i, (name, status) in enumerate(zip(names, statuses)):
            app_data = build_app_data(name)

            # Run real ML prediction
            try:
                result = run_prediction_new(app_data)
            except Exception as e:
                print(f"  ⚠️  ML failed for {name}: {e} — using fallback")
                result = {
                    "prediction": random.choice(["Y", "Y", "N"]),
                    "confidence": round(random.uniform(0.52, 0.95), 4),
                    "risk_band": random.choice(["Low", "Medium", "High"]),
                    "shap_values": {},
                    "derived_features": {"new_emi": 0, "debt_to_income": 0, "disposable_income": 0},
                }

            submitted_at = rand_submitted_at(status)

            new_app = LoanApplication(
                applicant_id=applicant.id,
                status=status,

                # Legacy required fields (we repurpose some)
                gender="Other",
                married=False,
                dependents=0,
                education="Graduate",
                self_employed=(app_data["employment_type"] != "salaried"),
                applicant_income=app_data["monthly_income"],
                coapplicant_income=0.0,
                loan_amount=app_data["loan_amount"],
                loan_amount_term=app_data["loan_tenure_months"],
                credit_score=app_data["credit_score"],
                property_type=app_data["property_type"],
                purpose=app_data["loan_purpose"],

                # ML results
                ml_prediction=result["prediction"],
                ml_confidence=result["confidence"],
                ml_risk_band=result["risk_band"],
                shap_values=json.dumps({
                    "form_data": app_data,
                    "shap": result["shap_values"],
                }),

                submitted_at=submitted_at,
                fed_to_training=False,
            )

            # Assign officer for under_review / decided
            if status in (ApplicationStatus.under_review, ApplicationStatus.approved, ApplicationStatus.rejected):
                new_app.officer_id = officer.id

            # Fill decision fields for completed apps
            if status == ApplicationStatus.approved:
                new_app.officer_decision = "Y"
                new_app.decided_at = submitted_at + timedelta(hours=random.randint(2, 12))
                new_app.fed_to_training = True
            elif status == ApplicationStatus.rejected:
                new_app.officer_decision = "N"
                new_app.override_reason = random.choice([
                    "Insufficient income vs loan size",
                    "Too many existing EMIs",
                    "Poor credit history",
                    "Employment instability"
                ])
                new_app.decided_at = submitted_at + timedelta(hours=random.randint(2, 12))
                new_app.fed_to_training = True

            db.add(new_app)
            created += 1
            print(f"  [{i+1:02d}] {name:<22} | {status.value:<12} | ML={result['prediction']} conf={result['confidence']:.2f}")

        db.commit()
        print(f"\n✅ Seeded {created} applications successfully.")
        print(f"   Officer login : officer@loansense.in / officer123")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seeding failed: {e}")
        import traceback; traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed loan applications for LoanSense")
    parser.add_argument("--clear", action="store_true", help="Clear existing seeded records first")
    args = parser.parse_args()
    print("\n🌱 Seeding LoanSense database...\n")
    seed(clear_existing=args.clear)
