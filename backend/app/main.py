from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weather, auth
from app.routers import weather, route
from app.database import init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(weather.router)
app.include_router(route.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "백엔드 서버 정상 작동 중"}