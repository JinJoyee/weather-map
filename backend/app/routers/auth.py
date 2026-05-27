from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    # DB 연동 전 프론트엔드 연동 테스트용 더미 계정
    if request.username == "admin" and request.password == "1234":
        return {
            "success": True,
            "message": "로그인 성공",
            "token": "dummy_jwt_token_123"
        }
    
    raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 틀렸습니다.")