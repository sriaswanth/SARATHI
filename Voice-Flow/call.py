from twilio.rest import Client
import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(Path(__file__).parent / ".env")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+19496067533")
TO_PHONE_NUMBER = os.getenv("TO_PHONE_NUMBER", "+919751724310")
NGROK_URL = os.getenv("NGROK_URL", "https://moderators-height-commonwealth-regularly.trycloudflare.com")

if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
    print("Warning: TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing in environment.")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

call = client.calls.create(
    to=TO_PHONE_NUMBER,
    from_=TWILIO_PHONE_NUMBER,
    url=f"{NGROK_URL}/incoming-call"
)

print("Call initiated successfully!")
print("Call SID:", call.sid)