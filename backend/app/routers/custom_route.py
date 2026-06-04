from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.custom_route import CustomRoute
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/routes/custom", tags=["custom_route"])


class CustomRouteCreate(BaseModel):
    name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    waypoints: Optional[List] = []
    context_tag: Optional[str] = None
    is_public: bool = False


@router.post("", status_code=201)
def create_custom_route(
    body: CustomRouteCreate,
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다")
    route = CustomRoute(
        user_id=user.id,
        name=body.name,
        start_lat=body.start_lat,
        start_lng=body.start_lng,
        end_lat=body.end_lat,
        end_lng=body.end_lng,
        waypoints=body.waypoints,
        context_tag=body.context_tag,
        is_public=body.is_public,
    )
    db.add(route)
    db.commit()
    db.refresh(route)
    return route


@router.get("")
def get_custom_routes(
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다")
    routes = db.query(CustomRoute).filter(CustomRoute.user_id == user.id).all()
    return {"total": len(routes), "routes": routes}


@router.get("/{route_id}")
def get_custom_route(
    route_id: int,
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다")
    route = db.query(CustomRoute).filter(
        CustomRoute.id == route_id,
        CustomRoute.user_id == user.id,
    ).first()
    if not route:
        raise HTTPException(status_code=404, detail="경로를 찾을 수 없습니다")
    return route


@router.delete("/{route_id}", status_code=204)
def delete_custom_route(
    route_id: int,
    username: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="사용자를 찾을 수 없습니다")
    route = db.query(CustomRoute).filter(CustomRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="경로를 찾을 수 없습니다")
    if route.user_id != user.id:
        raise HTTPException(status_code=403, detail="삭제 권한이 없습니다")
    db.delete(route)
    db.commit()
    return None


@router.get("/shared/list")
def get_shared_routes(
    context_tag: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(CustomRoute).filter(CustomRoute.is_public == True)
    if context_tag:
        query = query.filter(CustomRoute.context_tag == context_tag)
    total = query.count()
    routes = query.limit(limit).all()
    return {"total": total, "routes": routes}
