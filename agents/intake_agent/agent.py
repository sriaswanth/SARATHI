from pathlib import Path
import json
from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv(Path(__file__).parent / ".env")

client = OpenAI(
       base_url="https://api.groq.com/openai/v1",
       api_key=os.getenv("GROQ_API_KEY"),
   )

RULES_PATH = Path(__file__).parent / "rules.md"
SYSTEM_PROMPT = RULES_PATH.read_text()

def extract_incident(raw_text: str) -> dict:
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": raw_text},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)