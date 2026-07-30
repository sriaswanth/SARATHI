from pydantic import BaseModel
from typing import Optional


class ComplaintPrioritizationRequest(BaseModel):
    complaint: str
    location: str


class ComplaintPrioritizationResponse(BaseModel):
    priority: str
    category: str
    urgency_score: int
    summary: str
    recommended_action: str


class AIAllocationRequest(BaseModel):
    incident_id: Optional[int] = None
    location: str
    incident_type: str
    priority: str


class AIAllocationResponse(BaseModel):
    recommended_ambulance_id: Optional[int] = None
    recommended_ambulance: Optional[str] = None
    recommended_hospital_id: Optional[int] = None
    recommended_hospital: Optional[str] = None
    recommended_route: str
    rationale: str
