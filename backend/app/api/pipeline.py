import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[3] / "agents"))

from triage_agent.graph import run_pipeline
from fastapi import APIRouter

router = APIRouter()

@router.post("/report-incident")
def report_incident(payload: dict):
    return run_pipeline(payload["text"])