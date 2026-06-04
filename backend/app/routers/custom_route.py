from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.custom_route import CustomRoute

router = APIRouter(prefix="/api/routes/custom", tags=["custom_route"])

@router.get("")
def get_custom_routes(db: Session = Depends(get_db)):
    routes = db.query(CustomRoute).all()
    return routes

@router.delete("/{route_id}", status_code=204)
def delete_custom_route(route_id: int, db: Session = Depends(get_db)):
    route = db.query(CustomRoute).filter(CustomRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="경로를 찾을 수 없습니다")
    db.delete(route)
    db.commit()
    return None