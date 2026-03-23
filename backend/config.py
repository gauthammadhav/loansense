import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    App-wide configuration settings using Pydantic Settings.
    Loads environmental variables from the .env file.
    """
    SECRET_KEY: str
    DATABASE_URL: str = "sqlite:///./loansense.db"
    RETRAIN_THRESHOLD: int = 50
    MODEL_PATH: str = "ml/models/"
    DATA_PATH: str = "ml/data/"
    PDF_OUTPUT_PATH: str = "backend/generated_pdfs/"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALGORITHM: str = "HS256"

    # Pydantic v2 configuration
    model_config = SettingsConfigDict(env_file=".env")

# Single global instance for easy import throughout the application
settings = Settings()
