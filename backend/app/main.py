from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weather, route

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router)
app.include_router(route.router)

@app.get("/")
def root():
    return {"message": "백엔드 서버 정상 작동 중"}