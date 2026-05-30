from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_success():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "1234"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data


def test_login_wrong_password():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert response.status_code == 401


def test_login_wrong_username():
    response = client.post("/api/auth/login", json={"username": "unknown", "password": "1234"})
    assert response.status_code == 401


def test_login_missing_fields():
    response = client.post("/api/auth/login", json={})
    assert response.status_code == 422
