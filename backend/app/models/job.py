from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import datetime

class Job(Base):
    __tablename__ = "jobs"

    id         = Column(Integer, primary_key=True, index=True)
    filename   = Column(String)
    status     = Column(String, default="queued")
    result     = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="jobs")