import sys
from pathlib import Path

# Point Python at the agents/ folder (sibling of backend/)
sys.path.append(str(Path(__file__).resolve().parents[3] / "agents"))

from intake_agent.agent import extract_incident
from fastapi import APIRouter

router = APIRouter()

@router.post("/intake")
def intake_endpoint(payload: dict):
    return extract_incident(payload["text"])