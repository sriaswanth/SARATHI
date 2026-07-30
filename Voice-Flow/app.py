from fastapi import FastAPI, Form
from fastapi.responses import Response
from twilio.twiml.voice_response import VoiceResponse
from faster_whisper import WhisperModel
import requests
import os

app = FastAPI()


TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

# Load Whisper once when the server starts
model = WhisperModel("base", device="cpu", compute_type="int8")


@app.get("/")
def home():
    return {"status": "Emergency AI Backend Running"}


@app.post("/incoming-call")
async def incoming_call():

    response = VoiceResponse()

    response.say(
        "Hello. Welcome to Emergency AI.",
        voice="alice"
    )

    response.pause(length=1)

    response.say(
        "Please describe your emergency after the beep.",
        voice="alice"
    )

    response.record(
        action="/transcribe",
        method="POST",
        max_length=30,
        play_beep=True
    )

    return Response(
        content=str(response),
        media_type="application/xml"
    )


@app.post("/transcribe")
async def transcribe(
    RecordingUrl: str = Form(...)
):

    print(f"Downloading recording from: {RecordingUrl}")
    # Download the recorded audio using Twilio credentials
    audio_resp = requests.get(
        RecordingUrl + ".wav",
        auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    )
    audio_resp.raise_for_status()

    with open("caller.wav", "wb") as f:
        f.write(audio_resp.content)

    # Convert speech to text
    segments, info = model.transcribe("caller.wav")

    text = ""

    for segment in segments:
        text += segment.text

    print("\n==============================")
    print("Caller said:")
    print(text)
    print("==============================\n")

    response = VoiceResponse()

    response.say(
        "Thank you. I have received your message.",
        voice="alice"
    )

    response.hangup()

    return Response(
        content=str(response),
        media_type="application/xml"
    )