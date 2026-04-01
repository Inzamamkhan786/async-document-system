from app.core.celery import celery_app
from app.core.database import SessionLocal
from app.models.job import Job
import redis
import json
import time
import os

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

def publish_progress(r, job_id, event, message):
    payload = json.dumps({
        "job_id": job_id,
        "event": event,
        "message": message
    })
    r.publish("progress", payload)

@celery_app.task(bind=True)
def process_document(self, job_id: int):
    r = redis.from_url(REDIS_URL, decode_responses=True)
    db = SessionLocal()

    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"error": "Job not found"}

        job.status = "processing"
        db.commit()
        publish_progress(r, job_id, "job_started", "Job has started")

        publish_progress(r, job_id, "document_parsing_started", "Parsing document...")
        time.sleep(2)
        publish_progress(r, job_id, "document_parsing_completed", "Parsing complete")

        publish_progress(r, job_id, "field_extraction_started", "Extracting fields...")
        time.sleep(2)

        result = {
            "title": "Sample Document",
            "category": "General",
            "summary": "Auto generated summary",
            "keywords": ["AI", "Docs", "Processing"]
        }

        publish_progress(r, job_id, "field_extraction_completed", "Extraction complete")

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
```

---

**Deploy steps:**
```
1. Push all these changes to GitHub
2. Railway auto-redeploys from GitHub
3. In Railway dashboard → your service → Variables:
   - Add DATABASE_URL (from Postgres service)
   - Add REDIS_URL (from Redis service)
4. Trigger a manual redeploy
5. Check deploy logs for any errors
