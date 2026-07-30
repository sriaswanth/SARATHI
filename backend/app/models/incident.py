from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime, timezone
from app.database.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    type = Column(String, nullable=False)
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=True, default=13.0827)
    lng = Column(Float, nullable=True, default=80.2707)
    priority = Column(String, nullable=False, default="Medium")
    status = Column(String, nullable=False, default="Dispatching")
    assigned_ambulance = Column(String, nullable=True)
    assigned_hospital = Column(String, nullable=True)
    recommended_route = Column(String, nullable=True)
    ai_summary = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))