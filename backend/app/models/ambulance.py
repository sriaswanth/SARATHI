from sqlalchemy import Column, Integer, String, Float
from app.database.database import Base


class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String, nullable=False)
    driver_name = Column(String, nullable=False)
    contact = Column(String, nullable=True)
    location = Column(String, nullable=False)
    lat = Column(Float, nullable=True, default=13.0827)
    lng = Column(Float, nullable=True, default=80.2707)
    status = Column(String, default="Available")
    type = Column(String, default="Basic Life Support")