from fastapi import FastAPI
from app.api.user import router as user_router

app = FastAPI(
    title="SARATHI Backend",
    version="1.0"
)

app.include_router(user_router)

@app.get("/")
def home():
    return {"message": "SARATHI Backend Running"}