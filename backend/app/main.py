<<<<<<< HEAD
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.dashboard import router as dashboard_router
from app.api.incident import router as incident_router
from app.api.ambulance import router as ambulance_router
from app.api.hospital import router as hospital_router
from app.api.agent import router as agent_router
from app.api.ai import router as ai_router
from app.api.intake import router as intake_router
from app.api.pipeline import router as pipeline_router
from app.database.database import Base, engine, SessionLocal
from app.database.seed import seed_db
from app.models.hospital import Hospital
from app.models.ambulance import Ambulance
from app.models.incident import Incident
from app.models.agent import Agent
from app.models.audit_log import AuditLog

app = FastAPI(
    title="SARATHI Emergency API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(incident_router)
app.include_router(ambulance_router)
app.include_router(hospital_router)
app.include_router(agent_router)
app.include_router(ai_router)
app.include_router(intake_router, prefix="/api")
app.include_router(pipeline_router, prefix="/api")

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "SARATHI Emergency API is running dynamically!"}
=======
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.dashboard import router as dashboard_router
from app.api.incident import router as incident_router
from app.api.ambulance import router as ambulance_router
from app.api.hospital import router as hospital_router
from app.api.agent import router as agent_router
from app.api.ai import router as ai_router
from app.database.database import Base, engine, SessionLocal
from app.database.seed import seed_db
from app.models.hospital import Hospital
from app.models.ambulance import Ambulance
from app.models.incident import Incident
from app.models.agent import Agent
from app.models.audit_log import AuditLog


app = FastAPI(
    title="SARATHI Emergency API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(incident_router)
app.include_router(ambulance_router)
app.include_router(hospital_router)
app.include_router(agent_router)
app.include_router(ai_router)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "SARATHI Emergency API is running dynamically!"}
>>>>>>> f015de0 (Fix database integration and frontend-backend agent orchestration)
