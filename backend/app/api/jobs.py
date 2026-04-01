from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.job import Job
from app.models.user import User
from app.core.auth import get_current_user
from pydantic import BaseModel
from typing import Optional
import json, csv, io

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class UpdateResultRequest(BaseModel):
    result: Optional[dict] = None


@router.get("/jobs")
def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .order_by(Job.created_at.desc())
        .all()
    )


@router.get("/jobs/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.patch("/jobs/{job_id}")
def update_job(
    job_id: int,
    body: UpdateResultRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.result = body.result
    db.commit()
    db.refresh(job)
    return job


@router.post("/jobs/{job_id}/finalize")
def finalize_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = "finalized"
    db.commit()
    db.refresh(job)
    return job


@router.post("/jobs/{job_id}/retry")
def retry_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.workers.task import process_document
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = "queued"
    job.result = None
    db.commit()
    db.refresh(job)
    process_document.delay(job.id)
    return {"job_id": job.id}


@router.get("/jobs/{job_id}/export")
def export_job(
    job_id: int,
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.user_id == current_user.id
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.result:
        raise HTTPException(status_code=400, detail="No result to export")

    if format == "json":
        content = json.dumps({
            "id": job.id, "filename": job.filename,
            "status": job.status, "result": job.result,
            "created_at": str(job.created_at),
            "user_id": job.user_id
        }, indent=2)
        return StreamingResponse(
            io.StringIO(content), media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=job_{job_id}.json"}
        )
    elif format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        r = job.result
        writer.writerow(["id","filename","status","title","category","summary","keywords","created_at","user_id"])
        writer.writerow([
            job.id, job.filename, job.status,
            r.get("title",""), r.get("category",""), r.get("summary",""),
            "|".join(r.get("keywords",[])),
            str(job.created_at), job.user_id
        ])
        output.seek(0)
        return StreamingResponse(
            output, media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=job_{job_id}.csv"}
        )
    raise HTTPException(status_code=400, detail="Format must be json or csv")