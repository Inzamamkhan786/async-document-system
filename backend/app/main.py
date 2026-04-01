from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.upload import router as upload_router
from app.api.jobs import router as jobs_router
from app.api.progress import router as progress_router
from app.api.auth import router as auth_router
from app.core.database import Base, engine
from app.models import user, job
import os
import uvicorn

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Async Document Processing API Running"}

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(jobs_router)
app.include_router(progress_router)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
```

---

**4. Create `backend/Procfile`** — tells Railway how to start:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
worker: celery -A app.workers.task worker --loglevel=info --concurrency=1
