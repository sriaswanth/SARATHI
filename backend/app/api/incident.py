from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.dependencies import get_db
from app.models.incident import Incident
from app.models.audit_log import AuditLog
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentResponse

router = APIRouter(tags=["Incidents"])


@router.get("/incidents", response_model=List[IncidentResponse])
def get_incidents(
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if priority and priority != "All":
        query = query.filter(Incident.priority == priority)
    if status and status != "All":
        query = query.filter(Incident.status == status)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Incident.type.ilike(search_term)) |
            (Incident.location.ilike(search_term)) |
            (Incident.priority.ilike(search_term))
        )
    return query.order_by(Incident.id.desc()).all()


@router.get("/incidents/{id}", response_model=IncidentResponse)
def get_incident(id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.post("/incidents", response_model=IncidentResponse, status_code=201)
def create_incident(data: IncidentCreate, db: Session = Depends(get_db)):
    new_incident = Incident(**data.model_dump())
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    # Update assigned ambulance status if present
    if new_incident.assigned_ambulance:
        from app.models.ambulance import Ambulance
        amb = db.query(Ambulance).filter(
            (Ambulance.vehicle_number.ilike(f"%{new_incident.assigned_ambulance}%")) |
            (Ambulance.driver_name.ilike(f"%{new_incident.assigned_ambulance}%"))
        ).first()
        if amb:
            amb.status = "Dispatched"
            db.commit()

    # Add audit log
    audit = AuditLog(
        event=f"New Incident reported: {new_incident.type} at {new_incident.location} (Priority: {new_incident.priority}) - Assigned: {new_incident.assigned_ambulance or 'None'}",
        category="Incident"
    )
    db.add(audit)
    db.commit()

    return new_incident


@router.put("/incidents/{id}", response_model=IncidentResponse)
def update_incident(id: int, data: IncidentUpdate, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(incident, key, value)

    db.commit()
    db.refresh(incident)

    audit = AuditLog(
        event=f"Incident INC-{incident.id} updated: Status set to '{incident.status}'",
        category="Incident"
    )
    db.add(audit)
    db.commit()

    return incident


@router.delete("/incidents/{id}")
def delete_incident(id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident_type = incident.type
    db.delete(incident)
    db.commit()

    audit = AuditLog(
        event=f"Incident INC-{id} ({incident_type}) deleted from system",
        category="Incident"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Incident {id} deleted successfully"}