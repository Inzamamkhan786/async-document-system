from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
import redis
import asyncio

router = APIRouter()

@router.get("/progress")
async def progress():
    r = redis.Redis(host="localhost", port=6379, decode_responses=True)

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