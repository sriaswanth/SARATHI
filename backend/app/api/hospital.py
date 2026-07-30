from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.dependencies import get_db
from app.models.hospital import Hospital
from app.models.audit_log import AuditLog
from app.schemas.hospital import HospitalCreate, HospitalUpdate, HospitalResponse

router = APIRouter(tags=["Hospitals"])


@router.get("/hospitals", response_model=List[HospitalResponse])
def get_hospitals(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Hospital)
    if status and status != "All":
        query = query.filter(Hospital.status == status)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Hospital.name.ilike(search_term)) |
            (Hospital.location.ilike(search_term)) |
            (Hospital.specialties.ilike(search_term))
        )
    return query.order_by(Hospital.id.asc()).all()


@router.get("/hospitals/{id}", response_model=HospitalResponse)
def get_hospital(id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital


@router.post("/hospitals", response_model=HospitalResponse, status_code=201)
def create_hospital(data: HospitalCreate, db: Session = Depends(get_db)):
    new_hospital = Hospital(**data.model_dump())
    db.add(new_hospital)
    db.commit()
    db.refresh(new_hospital)

    audit = AuditLog(
        event=f"Hospital '{new_hospital.name}' added at {new_hospital.location} ({new_hospital.available_beds} beds available)",
        category="Hospital"
    )
    db.add(audit)
    db.commit()

    return new_hospital


@router.put("/hospitals/{id}", response_model=HospitalResponse)
def update_hospital(id: int, data: HospitalUpdate, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(hospital, key, value)

    # Auto-adjust status based on beds if available_beds updated
    if hospital.available_beds == 0:
        hospital.status = "Full"
    elif hospital.available_beds > 0 and hospital.status == "Full":
        hospital.status = "Available"

    db.commit()
    db.refresh(hospital)

    audit = AuditLog(
        event=f"Hospital '{hospital.name}' updated: Available beds = {hospital.available_beds}",
        category="Hospital"
    )
    db.add(audit)
    db.commit()

    return hospital


@router.delete("/hospitals/{id}")
def delete_hospital(id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    name = hospital.name
    db.delete(hospital)
    db.commit()

    audit = AuditLog(
        event=f"Hospital '{name}' removed from directory",
        category="Hospital"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Hospital {id} deleted successfully"}