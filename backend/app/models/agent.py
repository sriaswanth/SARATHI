from sqlalchemy import Column, Integer, String
from app.database.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Active")
    assigned_tasks = Column(Integer, default=0)