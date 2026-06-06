import time
from fastapi.testclient import TestClient
from app.main import app
from app.routers.auth import create_access_token

client = TestClient(app)

_TS = str(int(time.time()))
_USER = f"cr_user_{_TS}"
_OTHER = f"cr_other_{_TS}"


def _signup_and_token(username: str, password: str = "pw123") -> str:
    client.post("/api/auth/signup", json={"username": username, "password": password})
    r = client.post("/api/auth/login", json={"username": username, "password": password})
    return r.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


_ROUTE_BODY = {
    "name": "테스트경로",
    "start_lat": 36.35, "start_lng": 127.38,
    "end_lat": 36.36, "end_lng": 127.39,
    "waypoints": [],
    "context_tag": "주간",
    "is_public": False,
}


# --- POST /api/routes/custom ---

def test_create_custom_route():
    token = _signup_and_token(_USER)
    r = client.post("/api/routes/custom", json=_ROUTE_BODY, headers=_auth(token))
    assert r.status_code == 201
    assert r.json()["name"] == "테스트경로"


def test_create_custom_route_no_auth():
    r = client.post("/api/routes/custom", json=_ROUTE_BODY)
    assert r.status_code == 401


def test_create_custom_route_ghost_user():
    token = create_access_token({"sub": "ghost_no_exist_xyz"})
    r = client.post("/api/routes/custom", json=_ROUTE_BODY, headers=_auth(token))
    assert r.status_code == 401


# --- GET /api/routes/custom ---

def test_get_custom_routes():
    token = _signup_and_token(_USER)
    r = client.get("/api/routes/custom", headers=_auth(token))
    assert r.status_code == 200
    assert "routes" in r.json()


def test_get_custom_routes_ghost_user():
    token = create_access_token({"sub": "ghost_no_exist_xyz"})
    r = client.get("/api/routes/custom", headers=_auth(token))
    assert r.status_code == 401


# --- GET /api/routes/custom/shared/list ---

def test_get_shared_routes():
    r = client.get("/api/routes/custom/shared/list")
    assert r.status_code == 200
    assert "routes" in r.json()


def test_get_shared_routes_with_context_tag():
    r = client.get("/api/routes/custom/shared/list?context_tag=주간")
    assert r.status_code == 200


# --- GET /api/routes/custom/{route_id} ---

def test_get_custom_route_by_id():
    token = _signup_and_token(_USER)
    cr = client.post("/api/routes/custom", json=_ROUTE_BODY, headers=_auth(token))
    route_id = cr.json()["id"]
    r = client.get(f"/api/routes/custom/{route_id}", headers=_auth(token))
    assert r.status_code == 200
    assert r.json()["id"] == route_id


def test_get_custom_route_not_found():
    token = _signup_and_token(_USER)
    r = client.get("/api/routes/custom/99999999", headers=_auth(token))
    assert r.status_code == 404


def test_get_custom_route_ghost_user():
    token = create_access_token({"sub": "ghost_no_exist_xyz"})
    r = client.get("/api/routes/custom/1", headers=_auth(token))
    assert r.status_code == 401


# --- DELETE /api/routes/custom/{route_id} ---

def test_delete_custom_route():
    token = _signup_and_token(_USER)
    cr = client.post("/api/routes/custom", json=_ROUTE_BODY, headers=_auth(token))
    route_id = cr.json()["id"]
    r = client.delete(f"/api/routes/custom/{route_id}", headers=_auth(token))
    assert r.status_code == 204


def test_delete_custom_route_not_found():
    token = _signup_and_token(_USER)
    r = client.delete("/api/routes/custom/99999999", headers=_auth(token))
    assert r.status_code == 404


def test_delete_custom_route_forbidden():
    token_owner = _signup_and_token(_USER)
    token_other = _signup_and_token(_OTHER)
    cr = client.post("/api/routes/custom", json=_ROUTE_BODY, headers=_auth(token_owner))
    route_id = cr.json()["id"]
    r = client.delete(f"/api/routes/custom/{route_id}", headers=_auth(token_other))
    assert r.status_code == 403


def test_delete_custom_route_ghost_user():
    token = create_access_token({"sub": "ghost_no_exist_xyz"})
    r = client.delete("/api/routes/custom/1", headers=_auth(token))
    assert r.status_code == 401
