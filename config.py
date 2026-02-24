import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-secret-change-me")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
