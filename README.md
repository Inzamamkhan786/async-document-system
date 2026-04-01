# 📄 Async Document Processing System

A scalable **asynchronous document processing system** built using **FastAPI, Celery, Redis, and PostgreSQL**. This project allows users to upload documents, process them in the background, and track real‑time progress.

---

Live Link : https://async-document-system.vercel.app

# 🚀 Features

* 📤 Upload documents asynchronously
* ⚡ Background processing using Celery
* 📊 Real‑time progress tracking
* 🧠 Queue-based architecture
* 🗄️ PostgreSQL database integration
* 🔄 Redis as message broker
* 📁 Local file storage
* 🧾 Job status tracking (Queued, Processing, Completed)
* ⚙️ REST API endpoints

---

# 🏗️ Tech Stack

### Backend

* FastAPI
* Python
* Celery
* Redis
* PostgreSQL
* SQLAlchemy

### Tools & Libraries

* Uvicorn
* Pydantic
* Python‑multipart
* Alembic (optional for migrations)

---

# 📁 Project Structure

```
async-document-system/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload.py
│   │   │   ├── jobs.py
│   │   │   └── progress.py
│   │   │
│   │   ├── core/
│   │   │   └── database.py
│   │   │
│   │   ├── workers/
│   │   │   └── task.py
│   │   │
│   │   └── models/
│   │       └── job.py
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── venv/
│
└── README.md
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/InzamamKhan786/async-document-system.git
cd async-document-system/backend
```

---

## 2. Create Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🗄️ Setup PostgreSQL

Create a PostgreSQL database

```sql
CREATE DATABASE async_document_db;
```

Update database configuration in:

```
app/core/database.py
```

Example:

```python
DATABASE_URL = "postgresql://username:password@localhost/async_document_db"
```

---

# 🔴 Run Redis

### Using Docker

```bash
docker run -d -p 6379:6379 redis
```

Or install Redis locally.

---

# ▶️ Run FastAPI Server

```bash
uvicorn main:app --reload
```

Server will start at:

```
http://127.0.0.1:8000
```

---

# ⚡ Run Celery Worker

```bash
celery -A app.workers.task worker --pool=solo --loglevel=info
```

---

# 📡 API Endpoints

## Upload Document

```
POST /upload
```

Upload file and create processing job

---

## Get Jobs

```
GET /jobs
```

Fetch all jobs

---

## Check Progress

```
GET /progress/{job_id}
```

Get job processing status

---

# 🔄 Workflow

1. User uploads document
2. FastAPI creates job
3. Celery worker processes file
4. Redis manages queue
5. PostgreSQL stores job status
6. User tracks progress

---

# 🧪 Example Response

```json
{
  "job_id": "123",
  "status": "processing",
  "progress": 45
}
```

---

# 🛠️ Future Improvements

* File preview
* Authentication system
* Cloud storage support
* Multiple file processing
* Web dashboard
* WebSocket real‑time updates

---

# 👨‍💻 Author

**Mohd Inzamamul Haque**
B.Tech CSE (HCI & Gaming Technology)
IIIT Nagpur

---

# ⭐ Contribute

Contributions are welcome!

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Push to branch
5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License

---

# ⭐ If you like this project

Give it a ⭐ on GitHub!
