from fastapi import APIRouter
from pydantic import BaseModel

# 클라이언트가 전송할 데이터 모델 정의
class LoginRequest(BaseModel):
    username: str
    password: str