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


# --- database.py 커버 ---

from app.database import get_db, init_db


def test_get_db_yields_session():
    gen = get_db()
    db = next(gen)
    assert db is not None
    try:
        next(gen)
    except StopIteration:
        pass


def test_init_db_creates_tables():
    init_db()


# --- main.py startup 커버 ---

from unittest.mock import patch


def test_startup_fires_init_db():
    with patch("app.main.init_db") as mock_init:
        with TestClient(app) as c:
            c.get("/")
    mock_init.assert_called()
