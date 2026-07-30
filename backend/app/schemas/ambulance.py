from pydantic import BaseModel
from typing import Optional


class AmbulanceBase(BaseModel):
    vehicle_number: str
    driver_name: str
    contact: Optional[str] = None
    location: str
    lat: Optional[float] = 13.0827
    lng: Optional[float] = 80.2707
    status: str = "Available"
    type: str = "Basic Life Support"


class AmbulanceCreate(AmbulanceBase):
    pass


class AmbulanceUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    driver_name: Optional[str] = None
    contact: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: Optional[str] = None
    type: Optional[str] = None


class AmbulanceResponse(AmbulanceBase):
    id: int

    class Config:
        from_attributes = True
