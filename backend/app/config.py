import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Parse CORS_ORIGINS as list of strings
    _cors_origins_str: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
    CORS_ORIGINS: list[str] = [origin.strip() for origin in _cors_origins_str.split(",") if origin.strip()]

settings = Settings()
