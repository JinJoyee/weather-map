from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class ContextWaypoint(Base):
    __tablename__ = "context_waypoints"

    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    label = Column(String, nullable=False)
    type = Column(String, nullable=False)  # shelter / shade / lit_road
    area_code = Column(String, nullable=True)