from pydantic import BaseModel
from typing import Optional


class AgentBase(BaseModel):
    name: str
    role: str
    status: str = "Active"
    assigned_tasks: int = 0


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    assigned_tasks: Optional[int] = None


class AgentResponse(AgentBase):
    id: int

    class Config:
        from_attributes = True
