from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weather

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router)

@app.get("/")
def root():
    return {"message": "백엔드 서버 정상 작동 중"}