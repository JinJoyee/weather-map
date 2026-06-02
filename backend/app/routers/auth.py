from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.database import get_db
from app.models.user import User

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SignupRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    
    credentials_exception = HTTPException(
        status_code=401,
        detail="유효하지 않은 토큰입니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    return username

@router.post("/signup")
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    
    
    existing_user = db.query(User).filter(User.username == request.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    hashed_password = pwd_context.hash(request.password)
    new_user = User(username=request.username, password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "message": "회원가입이 완료되었습니다.",
        "data": {
            "id": new_user.id,
            "username": new_user.username
        }
    }

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 틀렸습니다.")
    
    if not pwd_context.verify(request.password, user.password):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 틀렸습니다.")

    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "success": True,
        "message": "로그인 성공",
        "access_token": access_token,
        "token_type": "bearer"
    }