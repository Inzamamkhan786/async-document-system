from fastapi import APIRouter, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.job import Job
from app.models.user import User
from app.workers.task import process_document
from app.core.auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/upload")
async def upload(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = Job(
        filename = file.filename,
        status   = "queued",
        user_id  = current_user.id
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    process_document.delay(job.id)
    return {"job_id": job.id}