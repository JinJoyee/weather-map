from dotenv import load_dotenv
import os

load_dotenv()

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY")
JWT_SECRET = os.getenv("JWT_SECRET", "secret")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
UV_API_KEY = os.getenv("UV_API_KEY")