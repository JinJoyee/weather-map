from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "백엔드 서버 정상 작동 중"}


def test_weather_endpoint_requires_params():
    response = client.get("/api/weather/current")
    assert response.status_code == 422


def test_route_endpoint_requires_params():
    response = client.get("/api/route/recommend")
    assert response.status_code == 422
