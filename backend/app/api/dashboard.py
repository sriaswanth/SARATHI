from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.dependencies import get_db
from app.models.incident import Incident
from app.models.ambulance import Ambulance
from app.models.hospital import Hospital
from app.models.agent import Agent
from app.models.audit_log import AuditLog

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    total_incidents = db.query(Incident).count()
    active_ambulances = db.query(Ambulance).filter(Ambulance.status == "Available").count()
    available_hospitals = db.query(Hospital).filter(Hospital.available_beds > 0).count()
    active_agents = db.query(Agent).filter(Agent.status != "Offline").count()
    critical_cases = db.query(Incident).filter(Incident.priority == "Critical").count()

    return {
        "total_incidents": total_incidents,
        "active_ambulances": active_ambulances,
        "available_hospitals": available_hospitals,
        "active_agents": active_agents,
        "critical_cases": critical_cases,
    }


@router.get("/dashboard/timeline")
def get_timeline(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(10).all()
    return [
        {
            "id": log.id,
            "time": log.created_at.strftime("%I:%M %p") if log.created_at else "Just now",
            "event": log.event,
            "category": log.category,
        }
        for log in logs
    ]