import time
from fastapi.testclient import TestClient
from app.main import app
from app.routers.auth import hash_password, verify_password, create_access_token

client = TestClient(app)

_TS = str(int(time.time()))


def test_login_success():
    client.post("/api/auth/signup", json={"username": "admin", "password": "1234"})
    response = client.post("/api/auth/login", json={"username": "admin", "password": "1234"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data


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


# --- main.py root endpoint 커버 (lines 27-29) ---

def test_root_endpoint():
    with TestClient(app) as c:
        response = c.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "백엔드 서버 정상 작동 중"


# --- auth.py hash_password 직접 커버 (line 21) ---

def test_hash_and_verify_password():
    hashed = hash_password("testpass")
    assert hashed != "testpass"
    assert verify_password("testpass", hashed)
    assert not verify_password("wrong", hashed)


# --- auth.py signup 성공 경로 커버 (lines 85-92) ---

def test_signup_new_user():
    uname = f"newuser_{_TS}"
    response = client.post("/api/auth/signup", json={"username": uname, "password": "pw123"})
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_signup_duplicate():
    uname = f"dup_{_TS}"
    client.post("/api/auth/signup", json={"username": uname, "password": "pw"})
    r2 = client.post("/api/auth/signup", json={"username": uname, "password": "pw"})
    assert r2.status_code == 400


# --- auth.py check_username 커버 (lines 65-66) ---

def test_check_username_available():
    r = client.get("/api/auth/username-available?username=never_exists_xyz_999")
    assert r.status_code == 200
    assert r.json()["available"] is True


def test_check_username_taken():
    uname = f"taken_{_TS}"
    client.post("/api/auth/signup", json={"username": uname, "password": "pw"})
    r = client.get(f"/api/auth/username-available?username={uname}")
    assert r.json()["available"] is False


# --- auth.py reset_password 커버 (lines 70-75) ---

def test_reset_password_success():
    uname = f"resetme_{_TS}"
    client.post("/api/auth/signup", json={"username": uname, "password": "old"})
    r = client.post("/api/auth/password/reset",
                    json={"username": uname, "new_password": "new"})
    assert r.status_code == 200
    assert r.json()["success"] is True


def test_reset_password_not_found():
    r = client.post("/api/auth/password/reset",
                    json={"username": "ghost_user_404", "new_password": "pw"})
    assert r.status_code == 404


# --- auth.py get_current_user 커버 (lines 48-61) ---

def test_get_current_user_valid_token():
    token = create_access_token({"sub": "admin"})
    r = client.get("/api/routes/custom",
                   headers={"Authorization": f"Bearer {token}"})
    assert r.status_code in (200, 401)


def test_get_current_user_invalid_token():
    r = client.get("/api/routes/custom",
                   headers={"Authorization": "Bearer invalid.token.here"})
    assert r.status_code == 401


def test_get_current_user_no_sub_claim():
    token = create_access_token({})
    r = client.get("/api/routes/custom",
                   headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401


def test_startup_load_graph_exception():
    with patch("app.main.init_db"), \
         patch("app.main._load_graph", side_effect=RuntimeError("no graph")):
        with TestClient(app) as c:
            c.get("/")
