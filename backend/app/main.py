from fastapi import FastAPI

app = FastAPI(
    title="SARATHI Backend",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "SARATHI Backend is running!"}