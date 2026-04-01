from app.core.celery import celery_app
from app.core.database import SessionLocal
from app.models.job import Job
import redis
import json
import time

def publish_progress(r, job_id, event, message):
    payload = json.dumps({
        "job_id": job_id,
        "event": event,
        "message": message
    })
    r.publish("progress", payload)

@celery_app.task(bind=True)
def process_document(self, job_id: int):
    r = redis.Redis(host="localhost", port=6379, decode_responses=True)
    db = SessionLocal()

    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found"}

        # Step 1: job_started
        job.status = "processing"
        db.commit()
        publish_progress(r, job_id, "job_started", "Job has started")

        # Step 2: parsing
        publish_progress(r, job_id, "document_parsing_started", "Parsing document...")
        time.sleep(2)
        publish_progress(r, job_id, "document_parsing_completed", "Parsing complete")

        # Step 3: extraction
        publish_progress(r, job_id, "field_extraction_started", "Extracting fields...")
        time.sleep(2)

        result = {
            "title": "Sample Document",
            "category": "General",
            "summary": "Auto generated summary",
            "keywords": ["AI", "Docs", "Processing"]
        }

        publish_progress(r, job_id, "field_extraction_completed", "Extraction complete")

        # Step 4: complete
        job.status = "completed"
        job.result = result
        db.commit()
        db.refresh(job)

        publish_progress(r, job_id, "job_completed", "Job finished successfully")

    except Exception as e:
        job.status = "failed"
        db.commit()
        publish_progress(r, job_id, "job_failed", f"Error: {str(e)}")
        raise
    finally:
        db.close()

    return result