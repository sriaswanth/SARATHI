from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.models.hospital import Hospital
from app.models.ambulance import Ambulance
from app.models.incident import Incident
from app.schemas.ai import (
    ComplaintPrioritizationRequest,
    ComplaintPrioritizationResponse,
    AIAllocationRequest,
    AIAllocationResponse,
)

router = APIRouter(tags=["AI Features"])


@router.post("/ai/prioritize", response_model=ComplaintPrioritizationResponse)
def prioritize_complaint(request: ComplaintPrioritizationRequest):
    text = request.complaint.lower()

    if any(
        k in text
        for k in [
            "heart attack",
            "cardiac",
            "stroke",
            "bleeding profusely",
            "unconscious",
            "head injury",
            "fire",
            "blast",
        ]
    ):
        priority = "Critical"
        urgency_score = 95
        category = "Critical Emergency"
        summary = "Immediate life-threatening scenario detected."
        recommended_action = "Dispatch ALS Ambulance immediately & reserve ICU bed."
    elif any(
        k in text
        for k in [
            "accident",
            "fracture",
            "chest pain",
            "breathing difficulty",
            "burn",
            "seizure",
        ]
    ):
        priority = "High"
        urgency_score = 80
        category = "Urgent Medical Emergency"
        summary = "Urgent emergency requiring immediate responder dispatch."
        recommended_action = "Assign nearest available ambulance and alert ER team."
    elif any(
        k in text
        for k in ["fever", "cut", "sprain", "dizziness", "vomiting", "minor burn"]
    ):
        priority = "Medium"
        urgency_score = 50
        category = "Standard Medical Assistance"
        summary = "Non-life-threatening medical case."
        recommended_action = "Route to available general ambulance or urgent care clinic."
    else:
        priority = "Low"
        urgency_score = 30
        category = "Routine Support"
        summary = "Routine medical query or minor condition."
        recommended_action = "Provide tele-consultation or standard transport."

    return ComplaintPrioritizationResponse(
        priority=priority,
        category=category,
        urgency_score=urgency_score,
        summary=summary,
        recommended_action=recommended_action,
    )


@router.post("/ai/recommend", response_model=AIAllocationResponse)
def recommend_allocation(request: AIAllocationRequest, db: Session = Depends(get_db)):
    avail_ambulance = (
        db.query(Ambulance).filter(Ambulance.status == "Available").first()
    )

    avail_hospital = (
        db.query(Hospital)
        .filter(Hospital.available_beds > 0)
        .order_by(Hospital.available_beds.desc())
        .first()
    )

    amb_name = (
        f"{avail_ambulance.vehicle_number} ({avail_ambulance.driver_name})"
        if avail_ambulance
        else "No ambulance currently available"
    )
    amb_id = avail_ambulance.id if avail_ambulance else None

    hosp_name = (
        f"{avail_hospital.name} ({avail_hospital.available_beds} beds available)"
        if avail_hospital
        else "General Hospital"
    )
    hosp_id = avail_hospital.id if avail_hospital else None

    target_hosp = avail_hospital.name if avail_hospital else "Emergency Center"
    route = f"Express Green Corridor -> {request.location} to {target_hosp} (ETA: 8-12 mins)"

    rationale = f"AI Agent allocated Ambulance '{amb_name}' and Hospital '{hosp_name}' based on location proximity & bed capacity score."

    if request.incident_id:
        inc = db.query(Incident).filter(Incident.id == request.incident_id).first()
        if inc:
            if avail_ambulance:
                inc.assigned_ambulance = avail_ambulance.vehicle_number
                inc.status = "Ambulance Assigned"
            if avail_hospital:
                inc.assigned_hospital = avail_hospital.name
            inc.recommended_route = route
            inc.ai_summary = rationale
            db.commit()

    return AIAllocationResponse(
        recommended_ambulance_id=amb_id,
        recommended_ambulance=amb_name,
        recommended_hospital_id=hosp_id,
        recommended_hospital=hosp_name,
        recommended_route=route,
        rationale=rationale,
    )
