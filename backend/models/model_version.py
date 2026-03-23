from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from backend.database import Base


class ModelVersion(Base):
    """
    Tracks every trained model version. Created automatically by the retraining service.
    """
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    version = Column(Integer, nullable=False, unique=True)
    file_path = Column(String(500), nullable=False)
    training_rows = Column(Integer, nullable=False)
    accuracy = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    precision_score = Column(Float, nullable=False)
    recall_score = Column(Float, nullable=False)
    is_current = Column(Boolean, nullable=False, default=False)
    trained_at = Column(DateTime, nullable=False, default=func.now())
    notes = Column(Text, nullable=True)

    def __repr__(self):
        return f"<ModelVersion(id={self.id}, version={self.version}, accuracy={self.accuracy}, is_current={self.is_current})>"
