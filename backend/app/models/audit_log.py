from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.database.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event = Column(String, nullable=False)
    category = Column(String, default="System")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
