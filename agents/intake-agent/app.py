from fastapi import FastAPI
from pydantic import BaseModel
import re

app = FastAPI()

PHONE_PATTERN = r'\b(?:\+91[-\s]?)?([6-9]\d{9})\b'
NAME_PATTERNS = [r"(?:i'?m|i am|this is|my name is|name is)\s+([A-Z][a-z]+)"]
KNOWN_LANDMARKS = ["anna nagar", "t nagar", "velachery", "tambaram", "adyar",
    "perungudi", "guindy", "porur", "kilpauk", "mylapore",
    "omr", "egmore", "besant nagar", "chromepet", "ashok nagar"]
LOCATION_TRIGGERS = [r"(?:near|at|in|around)\s+([A-Z][a-zA-Z\s]+(?:tower|nagar|road|street|junction|signal|station|hospital|park|bridge|colony|market))"]
MEDICAL_SPECIFIC = ["collapsed", "heart attack", "seizure", "choking", "labor",
    "pregnant", "allergic reaction", "fainted", "cardiac arrest"]
FIRE_KW = ["fire", "smoke", "burning", "flames", "caught fire", "electrical short", "explosion"]
ACCIDENT_KW = ["accident", "crash", "collided", "hit by", "run over", "vehicle", "bike accident", "car accident"]
DISASTER_KW = ["flood", "flooding", "wall collapsed", "roof collapsed", "gas leak", "tree fell", "building collapsed", "storm damage"]
GENERIC_SYMPTOMS = ["bleeding", "unconscious", "injured", "not breathing", "pain", "sick", "not moving"]
EMERGENCY_KEYWORDS = {"MEDICAL": MEDICAL_SPECIFIC, "FIRE": FIRE_KW, "ACCIDENT": ACCIDENT_KW, "DISASTER": DISASTER_KW}
CRITICAL_KEYWORDS = ["not breathing", "unconscious", "unresponsive", "severe bleeding", "trapped", "not moving", "cardiac arrest", "choking"]
HIGH_KEYWORDS = ["heart attack", "seizure", "fracture", "burn", "labor", "collided", "collapsed"]
MINOR_KEYWORDS = ["minor", "small", "mild", "scratch", "fender bender", "some water"]
NUMBER_WORDS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5}
FOLLOWUP_PRIORITY = ["location", "emergency_type"]
FOLLOWUP_QUESTIONS = {
    "location": "I understand, help is on the way. Can you tell me your exact location or a nearby landmark?",
    "emergency_type": "Can you tell me more about what's happening — is this a medical issue, fire, accident, or something else?",
}

def extract_phone(text):
    m = re.search(PHONE_PATTERN, text)
    return m.group(1) if m else None

def extract_name(text):
    for p in NAME_PATTERNS:
        m = re.search(p, text, re.IGNORECASE)
        if m: return m.group(1).capitalize()
    return None

def extract_location(text):
    text_lower = text.lower()
    for landmark in KNOWN_LANDMARKS:
        if landmark in text_lower:
            idx = text_lower.find(landmark)
            return text[max(0, idx-15): idx+len(landmark)+15].strip()
    for p in LOCATION_TRIGGERS:
        m = re.search(p, text, re.IGNORECASE)
        if m: return m.group(1).strip()
    return None

def extract_emergency_type(text):
    text_lower = text.lower()
    scores = {e: 0 for e in EMERGENCY_KEYWORDS}
    for etype, kws in EMERGENCY_KEYWORDS.items():
        for kw in kws:
            if kw in text_lower: scores[etype] += 1
    best = max(scores, key=scores.get)
    if scores[best] > 0: return best
    if any(s in text_lower for s in GENERIC_SYMPTOMS): return "MEDICAL"
    return None

def extract_severity(text, emergency_type):
    text_lower = text.lower()
    if any(kw in text_lower for kw in CRITICAL_KEYWORDS): return "CRITICAL"
    if any(kw in text_lower for kw in MINOR_KEYWORDS): return "MEDIUM"
    if any(kw in text_lower for kw in HIGH_KEYWORDS): return "HIGH"
    defaults = {"MEDICAL": "HIGH", "FIRE": "HIGH", "ACCIDENT": "MEDIUM", "DISASTER": "HIGH"}
    return defaults.get(emergency_type, "MEDIUM")

def extract_victim_count(text):
    text_lower = text.lower()
    m = re.search(r'\b(\d+)\s*(?:people|persons|victims|injured)\b', text_lower)
    if m: return int(m.group(1))
    for word, num in NUMBER_WORDS.items():
        if f"{word} people" in text_lower or f"{word} persons" in text_lower: return num
    return 1

def get_followup(state):
    for field in FOLLOWUP_PRIORITY:
        if not state.get(field): return FOLLOWUP_QUESTIONS[field]
    return None

class IntakeRequest(BaseModel):
    incident_id: str
    description: str
    language: str = "en"

@app.get("/")
def health():
    return {"status": "ok", "agent": "intake"}

@app.post("/extract")
def extract(req: IntakeRequest):
    text = req.description
    name = extract_name(text)
    phone = extract_phone(text)
    location = extract_location(text)
    emergency_type = extract_emergency_type(text)
    severity = extract_severity(text, emergency_type)
    victim_count = extract_victim_count(text)
    followup = get_followup({"location": location, "emergency_type": emergency_type})

    return {
        "emergency_type": emergency_type or "MEDICAL",
        "severity": severity,
        "victim_count": victim_count,
        "location_address": location or "",
        "description_summary": text,
        "language": req.language,
        "confidence": 0.95 if not followup else 0.5,
        "needs_followup": followup,
        "caller_name": name,
        "caller_phone": phone,
    }
