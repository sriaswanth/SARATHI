from pathlib import Path
import json
import os
import sys
import math
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END

# --- Make intake_agent importable (sibling folder) ---
sys.path.append(str(Path(__file__).parent.parent))
from intake_agent.agent import extract_incident

# --- Setup ---
load_dotenv(Path(__file__).parent / ".env")

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY"),
)

TRIAGE_RULES = (Path(__file__).parent / "triage_rules.md").read_text()
DISPATCH_RULES = (Path(__file__).parent / "dispatch_rules.md").read_text()

RESOURCES = pd.read_csv(Path(__file__).parent / "resources.csv")

# --- State ---
class IncidentState(TypedDict):
    raw_text: str
    caller_phone: Optional[str]
    location_text: Optional[str]
    location_confidence: Optional[str]
    emergency_type: Optional[str]
    severity: Optional[str]
    victim_count: Optional[int]
    description: Optional[str]
    language_detected: Optional[str]
    extraction_confidence: Optional[str]
    missing_fields: Optional[list]
    clarifying_question: Optional[str]
    incident_lat: Optional[float]
    incident_lng: Optional[float]
    # Triage outputs
    priority_score: Optional[int]
    priority_band: Optional[str]
    matched_resource_id: Optional[str]
    match_reasoning: Optional[str]
    escalation_needed: Optional[bool]
    escalation_reason: Optional[str]
    # Dispatch outputs
    dispatch_status: Optional[str]
    assigned_unit_name: Optional[str]
    eta_minutes: Optional[int]
    responder_notification: Optional[str]
    caller_notification: Optional[str]
    hospital_notification: Optional[str]

# --- Candidate resource filtering (plain Python) ---
TYPE_TO_RESOURCE = {
    "MEDICAL": "AMBULANCE",
    "ACCIDENT": "AMBULANCE",
    "FIRE": "FIRE_UNIT",
    "DISASTER": "AMBULANCE",
    "OTHER": None,
}

def get_candidates(emergency_type: str) -> list[dict]:
    resource_type = TYPE_TO_RESOURCE.get(emergency_type)
    if resource_type is None:
        return []
    matches = RESOURCES[
        (RESOURCES["resource_type"] == resource_type) &
        (RESOURCES["status"] == "AVAILABLE")
    ]
    return matches.to_dict(orient="records")

def haversine_km(lat1, lng1, lat2, lng2) -> float:
    R = 6371
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))

# --- Node 0: Intake (LLM call using rules.md) ---
def intake_node(state: IncidentState) -> dict:
    result = extract_incident(state["raw_text"])
    return result

# --- Conditional routing after Intake ---
def route_after_intake(state: IncidentState) -> str:
    if state.get("missing_fields") and "location" in state["missing_fields"]:
        return "needs_clarification"
    return "triage"

# --- Node 1: Triage (LLM call using triage_rules.md) ---
def triage_node(state: IncidentState) -> dict:
    candidates = get_candidates(state["emergency_type"])
    user_content = json.dumps({
        "incident": dict(state),
        "candidate_resources": candidates,
    })
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": TRIAGE_RULES},
            {"role": "user", "content": user_content},
        ],
        response_format={"type": "json_object"},
    )
    result = json.loads(response.choices[0].message.content)
    return result

# --- Node 2: Dispatch (ETA computed in code, then LLM writes notifications) ---
def dispatch_node(state: IncidentState) -> dict:
    matched_id = state.get("matched_resource_id")
    resource = None
    eta_minutes = None

    if matched_id:
        row = RESOURCES[RESOURCES["resource_id"] == matched_id]
        if not row.empty:
            resource = row.iloc[0].to_dict()
            # Fallback demo coordinates if incident has none yet (no geocoding built)
            inc_lat = state.get("incident_lat") or 13.0827
            inc_lng = state.get("incident_lng") or 80.2707
            distance_km = haversine_km(inc_lat, inc_lng, resource["lat"], resource["lng"])
            avg_speed_kmh = 40  # assumed city emergency-vehicle speed
            eta_minutes = max(1, round((distance_km / avg_speed_kmh) * 60))

    user_content = json.dumps({
        "priority_score": state.get("priority_score"),
        "priority_band": state.get("priority_band"),
        "matched_resource_id": matched_id,
        "escalation_needed": state.get("escalation_needed"),
        "resource": resource,
        "eta_minutes": eta_minutes,
        "location_text": state.get("location_text"),
        "description": state.get("description"),
    })

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": DISPATCH_RULES},
            {"role": "user", "content": user_content},
        ],
        response_format={"type": "json_object"},
    )
    result = json.loads(response.choices[0].message.content)
    return result

# --- Graph assembly: intake -> (triage -> dispatch) OR END if clarification needed ---
builder = StateGraph(IncidentState)
builder.add_node("intake", intake_node)
builder.add_node("triage", triage_node)
builder.add_node("dispatch", dispatch_node)

builder.set_entry_point("intake")
builder.add_conditional_edges(
    "intake",
    route_after_intake,
    {"triage": "triage", "needs_clarification": END}
)
builder.add_edge("triage", "dispatch")
builder.add_edge("dispatch", END)

sarathi_graph = builder.compile()

def run_pipeline(raw_text: str) -> dict:
    return sarathi_graph.invoke({"raw_text": raw_text})