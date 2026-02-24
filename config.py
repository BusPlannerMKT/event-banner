import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-me")
    PEXELS_API_KEY = os.getenv("PEXELS_API_KEY", "")
    SEND_FILE_MAX_AGE_DEFAULT = 0  # Disable static file caching in dev
