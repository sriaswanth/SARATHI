from pydantic import BaseModel
from typing import Optional


class HospitalBase(BaseModel):
    name: str
    location: str
    lat: Optional[float] = 13.0827
    lng: Optional[float] = 80.2707
    available_beds: int = 10
    total_beds: int = 50
    icu_beds: int = 5
    status: str = "Available"
    contact: Optional[str] = None
    specialties: Optional[str] = "Emergency, Trauma, ICU"


class HospitalCreate(HospitalBase):
    pass


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    available_beds: Optional[int] = None
    total_beds: Optional[int] = None
    icu_beds: Optional[int] = None
    status: Optional[str] = None
    contact: Optional[str] = None
    specialties: Optional[str] = None


class HospitalResponse(HospitalBase):
    id: int

    class Config:
        from_attributes = True
