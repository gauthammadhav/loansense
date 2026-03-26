from passlib.context import CryptContext
from backend.database import SessionLocal, Base, engine
from backend.models.user import User, UserRole
from backend.models.application import LoanApplication
from backend.models.audit_log import AuditLog
from backend.models.model_version import ModelVersion


# Password hashing configuration
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def seed_officer():
    """
    Seeds a default officer account if it doesn't already exist.
    """
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    try:
        # Check if officer already exists
        officer = db.query(User).filter(User.email == "officer@loansense.com").first()
        
        if officer:
            print("Officer already exists.")
            return

        # Create new officer user
        new_officer = User(
            email="officer@loansense.com",
            hashed_password=hash_password("Officer@123"),
            full_name="Kavitha Menon",
            role=UserRole.officer,
            is_active=True
        )

        db.add(new_officer)
        db.commit()
        db.refresh(new_officer)
        print("Officer account created.")

    except Exception as e:
        print(f"Error seeding officer account: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_officer()
