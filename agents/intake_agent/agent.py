from pathlib import Path
import json
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent.parent.parent / ".env")

RULES_PATH = Path(__file__).parent / "rules.md"
SYSTEM_PROMPT = RULES_PATH.read_text() if RULES_PATH.exists() else ""

def extract_incident(raw_text: str) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    
    if api_key:
        try:
            client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=api_key,
            )
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": raw_text},
                ],
                response_format={"type": "json_object"},
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Groq API call error in extract_incident: {e}. Falling back to keyword extraction.")

    # Rule-based fallback if GROQ_API_KEY is missing or API call fails
    raw_lower = raw_text.lower()
    has_location = any(loc in raw_lower for loc in [
        "nagar", "road", "street", "tower", "station", "hospital", "near", "at",
        "junction", "colony", "market", "bridge", "park", "adyar", "guindy", "velachery"
    ])
    
    missing_fields = [] if has_location else ["location"]
    clarifying_q = None if has_location else "Can you please state your exact location or a nearby landmark?"
    
    # Simple emergency type heuristic
    if any(k in raw_lower for k in ["fire", "smoke", "flame", "burning"]):
        etype = "FIRE"
    elif any(k in raw_lower for k in ["crash", "accident", "hit", "vehicle", "bike", "car"]):
        etype = "ACCIDENT"
    elif any(k in raw_lower for k in ["flood", "storm", "gas", "collapse"]):
        etype = "DISASTER"
    else:
        etype = "MEDICAL"

    return {
        "caller_phone": None,
        "location_text": raw_text if has_location else None,
        "location_confidence": "MEDIUM" if has_location else "LOW",
        "emergency_type": etype,
        "severity": "HIGH",
        "victim_count": 1,
        "description": raw_text,
        "language_detected": "ENGLISH",
        "extraction_confidence": "HIGH" if has_location else "LOW",
        "missing_fields": missing_fields,
        "clarifying_question": clarifying_q,
    }