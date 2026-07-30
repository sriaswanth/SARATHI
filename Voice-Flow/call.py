from twilio.rest import Client
import os

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

client = Client(account_sid, auth_token)

call = client.calls.create(
    to="+919751724310",                  # Your verified Indian number
    from_="+19496067533",                # Your Twilio number
    url="https://bust-approval-smock.ngrok-free.dev/incoming-call"
)

print("Call SID:", call.sid)