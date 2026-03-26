"""
One-time script: re-seeds the officer account using bcrypt (replacing the old pbkdf2_sha256 hash).
Run from the loansense root: python fix_officer.py
"""
from passlib.context import CryptContext
from backend.database import SessionLocal, Base, engine
from backend.models.user import User, UserRole

pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto", sha256_crypt__default_rounds=50000)

def fix():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Remove stale officer record (has old pbkdf2 hash)
        old = db.query(User).filter(User.email == "officer@loansense.com").first()
        if old:
            db.delete(old)
            db.commit()
            print("Deleted old officer record (stale pbkdf2_sha256 hash).")

        # Re-create with bcrypt hash
        officer = User(
            email="officer@loansense.com",
            hashed_password=pwd_context.hash("Officer@123"),
            full_name="Kavitha Menon",
            role=UserRole.officer,
            is_active=True
        )
        db.add(officer)
        db.commit()
        print("Officer account re-seeded with bcrypt hash. Login should now work.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix()
