from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import redis
import asyncio
import os

router = APIRouter()

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

@router.get("/progress")
async def progress():
    r = redis.from_url(REDIS_URL, decode_responses=True)

    async def event_stream():
        pubsub = r.pubsub()
        pubsub.subscribe("progress")
        try:
            while True:
                message = pubsub.get_message(ignore_subscribe_messages=True)
                if message and message["type"] == "message":
                    yield {
                        "event": "message",
                        "data": message["data"]
                    }
                await asyncio.sleep(0.1)
        except asyncio.CancelledError:
            pubsub.unsubscribe("progress")
            raise

    return EventSourceResponse(event_stream())
