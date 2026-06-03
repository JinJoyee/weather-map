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
