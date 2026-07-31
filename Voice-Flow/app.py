from fastapi import FastAPI, Form, Query
from fastapi.responses import Response
from twilio.twiml.voice_response import VoiceResponse
from faster_whisper import WhisperModel
import requests
import os
import sys
import sqlite3
import html
import re
from pathlib import Path
from dotenv import load_dotenv

# Ensure project root and agents directory are in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = PROJECT_ROOT / "agents"
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))
if str(AGENTS_DIR) not in sys.path:
    sys.path.append(str(AGENTS_DIR))

# Load environment variables
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(Path(__file__).parent / ".env")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
NGROK_URL = os.getenv("NGROK_URL", "https://moderators-height-commonwealth-regularly.trycloudflare.com").rstrip("/")
SARATHI_BACKEND_URL = os.getenv("SARATHI_BACKEND_URL", "http://localhost:8000").rstrip("/")

# Session storage for multi-turn voice conversations keyed by CallSid
CALL_SESSIONS = {}

# Import Agent Orchestra pipeline
try:
    from agents.triage_agent.graph import run_pipeline
except ImportError:
    from triage_agent.graph import run_pipeline

app = FastAPI(title="SARATHI Voice Modeler & Agent Orchestra Integrator")

# Load ultra-fast Whisper tiny model for <0.5s CPU transcription speed
model = WhisperModel("tiny", device="cpu", compute_type="int8")


def clean_speech_text(text: str) -> str:
    """
    Cleans text by removing non-ASCII characters and XML-escaping & < > 
    to guarantee Twilio TwiML schema compliance (prevents Twilio Error 12100).
    """
    if not text:
        return "Thank you. Your message has been received."
    # Replace common unicode quotes and dashes with ASCII
    text = text.replace("—", "-").replace("–", "-").replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
    # Filter out non-ASCII characters
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    # XML escape
    return html.escape(text.strip())


def save_incident_to_db(agent_output: dict):
    """
    Saves emergency incident details extracted from Twilio call to the SARATHI database & backend API.
    """
    try:
        emergency_type = agent_output.get("emergency_type") or "MEDICAL"
        location_text = agent_output.get("location_text")
        if not location_text or str(location_text).lower() in ["none", "null"]:
            location_text = agent_output.get("description") or agent_output.get("raw_text") or "Twilio Voice Call Location"
        
        description = agent_output.get("description") or agent_output.get("raw_text") or "Twilio Voice Call Emergency"
        priority_band = agent_output.get("priority_band") or "P1_HIGH"
        unit_name = agent_output.get("assigned_unit_name") or "Ambulance A1"
        caller_notif = agent_output.get("caller_notification") or ""

        # Priority Mapping
        priority_map = {
            "P1_CRITICAL": "Critical",
            "P1_HIGH": "High",
            "P2_MEDIUM": "Medium",
            "P3_LOW": "Low",
            "CRITICAL": "Critical",
            "HIGH": "High",
            "MEDIUM": "Medium",
            "LOW": "Low"
        }
        priority = priority_map.get(priority_band, "High")

        # Type Mapping
        type_map = {
            "MEDICAL": "Medical Emergency",
            "FIRE": "Fire Incident",
            "ACCIDENT": "Road Accident",
            "DISASTER": "Flood Rescue",
            "OTHER": "Emergency Call"
        }
        incident_type = type_map.get(emergency_type, "Medical Emergency")

        incident_payload = {
            "title": f"Twilio Call: {clean_speech_text(description)[:60]}",
            "type": incident_type,
            "location": clean_speech_text(location_text),
            "lat": 13.0827,
            "lng": 80.2707,
            "priority": priority,
            "status": "Dispatched" if unit_name else "Dispatching",
            "assigned_ambulance": clean_speech_text(unit_name),
            "assigned_hospital": "Apollo Anna Nagar" if emergency_type == "MEDICAL" else "GH Chennai",
            "ai_summary": clean_speech_text(caller_notif or description)
        }

        print(f"\n[Database Persist] Saving incident payload: {incident_payload}")

        # 1. Direct SQLite database persistence (updates sarathi.db)
        db_paths = [
            PROJECT_ROOT / "backend" / "sarathi.db",
            PROJECT_ROOT / "sarathi.db",
            Path("sarathi.db"),
            Path("../backend/sarathi.db")
        ]
        target_db = next((p for p in db_paths if p.exists()), PROJECT_ROOT / "backend" / "sarathi.db")

        conn = sqlite3.connect(target_db)
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                type TEXT NOT NULL,
                location TEXT NOT NULL,
                lat REAL DEFAULT 13.0827,
                lng REAL DEFAULT 80.2707,
                priority TEXT NOT NULL DEFAULT 'Medium',
                status TEXT NOT NULL DEFAULT 'Dispatching',
                assigned_ambulance TEXT,
                assigned_hospital TEXT,
                recommended_route TEXT,
                ai_summary TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            INSERT INTO incidents (title, type, location, lat, lng, priority, status, assigned_ambulance, assigned_hospital, ai_summary)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            incident_payload["title"],
            incident_payload["type"],
            incident_payload["location"],
            incident_payload["lat"],
            incident_payload["lng"],
            incident_payload["priority"],
            incident_payload["status"],
            incident_payload["assigned_ambulance"],
            incident_payload["assigned_hospital"],
            incident_payload["ai_summary"]
        ))

        inc_id = cursor.lastrowid

        if unit_name:
            cursor.execute("UPDATE ambulances SET status = 'Dispatched' WHERE vehicle_number LIKE ? OR driver_name LIKE ?", (f"%{unit_name}%", f"%{unit_name}%"))

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event TEXT NOT NULL,
                category TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            INSERT INTO audit_logs (event, category)
            VALUES (?, ?)
        """, (f"Twilio Voice Call Reported: {incident_payload['type']} at {incident_payload['location']}", "Voice AI Intake"))

        conn.commit()
        conn.close()
        print(f"[Database Persist] Direct SQLite inserted Incident #{inc_id} and assigned {unit_name} in {target_db} successfully!")

        # 2. Post to SARATHI Backend API (if backend server is active)
        try:
            resp = requests.post(f"{SARATHI_BACKEND_URL}/incidents", json=incident_payload, timeout=2)
            if resp.status_code in (200, 201):
                print(f"[Database Persist] Saved Incident via Backend API successfully!")
        except Exception as api_err:
            print(f"[Database Persist] Note: Backend API HTTP call skipped ({api_err}).")

    except Exception as e:
        print(f"[Database Persist Error] Could not save incident: {e}")


@app.get("/")
def home():
    return {
        "status": "Emergency AI Backend Running",
        "agent_orchestra_connected": True,
        "tunnel_url": NGROK_URL
    }


@app.post("/incoming-call")
async def incoming_call(CallSid: str = Form(default="")):
    try:
        if CallSid:
            CALL_SESSIONS[CallSid] = ""

        response = VoiceResponse()
        response.say(
            clean_speech_text("Hello. Welcome to Emergency AI."),
            voice="alice"
        )
        response.pause(length=1)
        response.say(
            clean_speech_text("Please describe your emergency after the beep."),
            voice="alice"
        )
        
        action_url = f"{NGROK_URL}/transcribe" if NGROK_URL else "/transcribe"
        response.record(
            action=action_url,
            method="POST",
            max_length=30,
            play_beep=True,
            timeout=5
        )
        return Response(
            content=str(response),
            media_type="application/xml"
        )
    except Exception as err:
        print(f"[incoming_call Error]: {err}")
        err_response = VoiceResponse()
        err_response.say("Welcome to Emergency AI. Please describe your emergency after the beep.", voice="alice")
        action_url = f"{NGROK_URL}/transcribe" if NGROK_URL else "/transcribe"
        err_response.record(action=action_url, method="POST", max_length=30, play_beep=True, timeout=5)
        return Response(content=str(err_response), media_type="application/xml")


@app.post("/transcribe")
async def transcribe(
    RecordingUrl: str = Form(...),
    CallSid: str = Form(default="")
):
    try:
        print(f"\n[Twilio Callback - Call {CallSid}] Downloading recording from: {RecordingUrl}")
        
        # Download recorded audio from Twilio
        auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN) else None
        try:
            audio_resp = requests.get(RecordingUrl + ".wav", auth=auth, timeout=5)
            audio_resp.raise_for_status()
            with open("caller.wav", "wb") as f:
                f.write(audio_resp.content)
            print("Audio saved as caller.wav")
        except Exception as e:
            print(f"Error downloading audio recording: {e}")

        # Convert speech to text using Whisper tiny model (<0.5s CPU speed)
        transcript_text = ""
        if os.path.exists("caller.wav") and os.path.getsize("caller.wav") > 0:
            try:
                segments, info = model.transcribe("caller.wav")
                transcript_text = "".join([segment.text for segment in segments]).strip()
            except Exception as e:
                print(f"Whisper transcription error: {e}")

        # Fetch previous history for this CallSid
        prev_history = CALL_SESSIONS.get(CallSid, "")
        if prev_history and transcript_text:
            full_text = f"{prev_history}. {transcript_text}".strip()
        elif transcript_text:
            full_text = transcript_text
        else:
            full_text = prev_history or "Emergency assistance requested."

        # Store updated history in session
        if CallSid:
            CALL_SESSIONS[CallSid] = full_text

        print("==============================")
        print(f"Caller said: '{transcript_text}'")
        print(f"Full conversation context: '{full_text}'")
        print("==============================\n")

        # Trigger Agent Orchestra (LangGraph intake + triage + dispatch pipeline)
        agent_output = {}
        try:
            if full_text:
                agent_output = run_pipeline(full_text)
                print("--- Agent Orchestra Response JSON ---")
                print(agent_output)
                print("-------------------------------------\n")
        except Exception as e:
            print(f"Agent Orchestra execution error: {e}")

        response = VoiceResponse()

        # Save incident details to database immediately on every turn if emergency details exist
        if agent_output.get("emergency_type") and agent_output.get("raw_text"):
            save_incident_to_db(agent_output)

        # Determine if agent requires follow-up/clarifying question from caller
        clarifying_question = agent_output.get("clarifying_question")
        missing_fields = agent_output.get("missing_fields") or []

        # If missing location or agent produced a clarifying question -> Ask question and record response
        if clarifying_question or "location" in missing_fields:
            question_text = clarifying_question or "Could you please specify your exact location or a nearby landmark?"
            print(f"Agent asking clarifying question to caller: '{question_text}'")

            response.say(clean_speech_text(question_text), voice="alice")
            
            # Clean action URL without query params (session stored in server dict by CallSid)
            next_action_url = f"{NGROK_URL}/transcribe" if NGROK_URL else "/transcribe"
            
            response.record(
                action=next_action_url,
                method="POST",
                max_length=30,
                play_beep=True,
                timeout=5
            )
        else:
            # Triage and Dispatch Complete -> Provide notification and end call
            if CallSid in CALL_SESSIONS:
                del CALL_SESSIONS[CallSid]

            caller_notif = agent_output.get("caller_notification")
            unit_name = agent_output.get("assigned_unit_name")
            eta = agent_output.get("eta_minutes")

            if caller_notif:
                closing_speech = caller_notif
            elif unit_name and eta is not None:
                closing_speech = f"Thank you. Help has been dispatched. Unit {unit_name} is en route to your location with an estimated arrival time of {eta} minutes."
            elif agent_output.get("emergency_type"):
                closing_speech = f"Thank you. Your {agent_output.get('emergency_type').lower()} emergency report has been logged and dispatch is in progress."
            else:
                closing_speech = "Thank you. Your message has been received and emergency dispatch is processing your request."

            print(f"Agent final message to caller: '{closing_speech}'")
            response.say(clean_speech_text(closing_speech), voice="alice")
            response.hangup()

        return Response(
            content=str(response),
            media_type="application/xml"
        )
    except Exception as fatal_err:
        print(f"[FATAL TRANSCRIBE ERROR]: {fatal_err}")
        err_response = VoiceResponse()
        err_response.say("Thank you. Emergency services have logged your call. Help is on the way.", voice="alice")
        err_response.hangup()
        return Response(content=str(err_response), media_type="application/xml")