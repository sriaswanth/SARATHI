from sqlalchemy import Column, Integer, String, Float
from app.database.database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=True, default=13.0827)
    lng = Column(Float, nullable=True, default=80.2707)
    available_beds = Column(Integer, default=10)
    total_beds = Column(Integer, default=50)
    icu_beds = Column(Integer, default=5)
    status = Column(String, default="Available")
    contact = Column(String, nullable=True)
    specialties = Column(String, nullable=True)