from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.dependencies import get_db
from app.models.ambulance import Ambulance
from app.models.audit_log import AuditLog
from app.schemas.ambulance import AmbulanceCreate, AmbulanceUpdate, AmbulanceResponse

router = APIRouter(tags=["Ambulances"])


@router.get("/ambulances", response_model=List[AmbulanceResponse])
def get_ambulances(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Ambulance)
    if status and status != "All":
        query = query.filter(Ambulance.status == status)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Ambulance.vehicle_number.ilike(search_term)) |
            (Ambulance.driver_name.ilike(search_term)) |
            (Ambulance.location.ilike(search_term))
        )
    return query.order_by(Ambulance.id.desc()).all()


@router.get("/ambulances/{id}", response_model=AmbulanceResponse)
def get_ambulance(id: int, db: Session = Depends(get_db)):
    ambulance = db.query(Ambulance).filter(Ambulance.id == id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return ambulance


@router.post("/ambulances", response_model=AmbulanceResponse, status_code=201)
def create_ambulance(data: AmbulanceCreate, db: Session = Depends(get_db)):
    new_ambulance = Ambulance(**data.model_dump())
    db.add(new_ambulance)
    db.commit()
    db.refresh(new_ambulance)

    audit = AuditLog(
        event=f"Ambulance {new_ambulance.vehicle_number} registered (Driver: {new_ambulance.driver_name})",
        category="Ambulance"
    )
    db.add(audit)
    db.commit()

    return new_ambulance


@router.put("/ambulances/{id}", response_model=AmbulanceResponse)
def update_ambulance(id: int, data: AmbulanceUpdate, db: Session = Depends(get_db)):
    ambulance = db.query(Ambulance).filter(Ambulance.id == id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(ambulance, key, value)

    db.commit()
    db.refresh(ambulance)

    audit = AuditLog(
        event=f"Ambulance {ambulance.vehicle_number} status changed to '{ambulance.status}'",
        category="Ambulance"
    )
    db.add(audit)
    db.commit()

    return ambulance


@router.delete("/ambulances/{id}")
def delete_ambulance(id: int, db: Session = Depends(get_db)):
    ambulance = db.query(Ambulance).filter(Ambulance.id == id).first()
    if not ambulance:
        raise HTTPException(status_code=404, detail="Ambulance not found")

    vehicle_num = ambulance.vehicle_number
    db.delete(ambulance)
    db.commit()

    audit = AuditLog(
        event=f"Ambulance {vehicle_num} removed from fleet",
        category="Ambulance"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Ambulance {id} deleted successfully"}