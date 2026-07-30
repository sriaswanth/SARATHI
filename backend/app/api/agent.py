from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.dependencies import get_db
from app.models.agent import Agent
from app.models.audit_log import AuditLog
from app.schemas.agent import AgentCreate, AgentUpdate, AgentResponse

router = APIRouter(tags=["Agents"])


@router.get("/agents", response_model=List[AgentResponse])
def get_agents(db: Session = Depends(get_db)):
    agents = db.query(Agent).order_by(Agent.id.asc()).all()
    return agents


@router.get("/agents/{id}", response_model=AgentResponse)
def get_agent(id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/agents", response_model=AgentResponse, status_code=201)
def create_agent(data: AgentCreate, db: Session = Depends(get_db)):
    new_agent = Agent(**data.model_dump())
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)

    audit = AuditLog(
        event=f"AI Agent '{new_agent.name}' ({new_agent.role}) deployed",
        category="Agent"
    )
    db.add(audit)
    db.commit()

    return new_agent


@router.put("/agents/{id}", response_model=AgentResponse)
def update_agent(id: int, data: AgentUpdate, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(agent, key, value)

    db.commit()
    db.refresh(agent)

    audit = AuditLog(
        event=f"AI Agent '{agent.name}' status updated to '{agent.status}'",
        category="Agent"
    )
    db.add(audit)
    db.commit()

    return agent


@router.delete("/agents/{id}")
def delete_agent(id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    name = agent.name
    db.delete(agent)
    db.commit()

    audit = AuditLog(
        event=f"AI Agent '{name}' decommissioned",
        category="Agent"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Agent {id} deleted successfully"}