import sys
import os

# backend/ 를 Python 경로에 추가 (from app.* import 가능하게)
BACKEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, os.path.abspath(BACKEND_DIR))

# SQLite DB 등 상대 경로가 backend/ 기준으로 동작하도록 작업 디렉토리 변경
os.chdir(os.path.abspath(BACKEND_DIR))

# 매 테스트 세션마다 DB를 새로 생성해 clean state 보장
if os.path.exists("app.db"):
    os.remove("app.db")

from app.database import init_db
init_db()
