from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class IncidentBase(BaseModel):
    title: Optional[str] = None
    type: str
    location: str
    lat: Optional[float] = 13.0827
    lng: Optional[float] = 80.2707
    priority: str = "Medium"
    status: str = "Dispatching"
    assigned_ambulance: Optional[str] = None
    assigned_hospital: Optional[str] = None
    recommended_route: Optional[str] = None
    ai_summary: Optional[str] = None


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_ambulance: Optional[str] = None
    assigned_hospital: Optional[str] = None
    recommended_route: Optional[str] = None


class IncidentResponse(IncidentBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
