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
load_dotenv(Path(__file__).parent.parent.parent / ".env")

api_key = os.getenv("GROQ_API_KEY") or "dummy_key_for_dev"
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=api_key,
)

TRIAGE_RULES = (Path(__file__).parent / "triage_rules.md").read_text() if (Path(__file__).parent / "triage_rules.md").exists() else ""
DISPATCH_RULES = (Path(__file__).parent / "dispatch_rules.md").read_text() if (Path(__file__).parent / "dispatch_rules.md").exists() else ""

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

# --- Node 0: Intake ---
def intake_node(state: IncidentState) -> dict:
    result = extract_incident(state["raw_text"])
    return result

# --- Conditional routing after Intake ---
def route_after_intake(state: IncidentState) -> str:
    if state.get("missing_fields") and "location" in state["missing_fields"]:
        return "needs_clarification"
    return "triage"

# --- Node 1: Triage ---
def triage_node(state: IncidentState) -> dict:
    candidates = get_candidates(state.get("emergency_type", "MEDICAL"))
    
    if os.getenv("GROQ_API_KEY"):
        try:
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
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Triage LLM error: {e}. Using fallback triage.")

    # Fallback triage logic
    matched_id = candidates[0]["resource_id"] if candidates else "AMBULANCE_01"
    return {
        "priority_score": 9,
        "priority_band": "P1_CRITICAL",
        "matched_resource_id": matched_id,
        "match_reasoning": "First available unit assigned via fallback rule.",
        "escalation_needed": False,
        "escalation_reason": None,
    }

# --- Node 2: Dispatch ---
def dispatch_node(state: IncidentState) -> dict:
    matched_id = state.get("matched_resource_id")
    resource = None
    eta_minutes = 5

    if matched_id:
        row = RESOURCES[RESOURCES["resource_id"] == matched_id]
        if not row.empty:
            resource = row.iloc[0].to_dict()
            inc_lat = state.get("incident_lat") or 13.0827
            inc_lng = state.get("incident_lng") or 80.2707
            distance_km = haversine_km(inc_lat, inc_lng, resource["lat"], resource["lng"])
            avg_speed_kmh = 40
            eta_minutes = max(1, round((distance_km / avg_speed_kmh) * 60))

    if os.getenv("GROQ_API_KEY"):
        try:
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
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Dispatch LLM error: {e}. Using fallback dispatch.")

    unit_name = (resource.get("name") or resource.get("resource_name")) if resource else "Emergency Unit 1"
    loc = state.get("location_text") or "your location"
    return {
        "dispatch_status": "DISPATCHED",
        "assigned_unit_name": unit_name,
        "eta_minutes": eta_minutes,
        "responder_notification": f"ALERT: Dispatch {unit_name} to {loc}.",
        "caller_notification": f"Emergency response unit {unit_name} has been dispatched to {loc}. Estimated arrival time is {eta_minutes} minutes.",
        "hospital_notification": f"INCOMING PATIENT: ETA {eta_minutes} minutes.",
    }

# --- Graph assembly ---
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