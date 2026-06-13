"""
WebSocket connection manager.
Manages active connections per batch_id.
Bridges Celery worker events via Redis pub/sub to WebSocket clients.
"""

import asyncio
import json
from typing import Dict, List

from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect

from app.core.logging import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections grouped by batch_id.
    Workers publish events to Redis; this manager forwards them to clients.
    """

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, batch_id: str) -> None:
        await websocket.accept()
        if batch_id not in self.active_connections:
            self.active_connections[batch_id] = []
        self.active_connections[batch_id].append(websocket)
        logger.info("WebSocket connected", batch_id=batch_id, total=len(self.active_connections[batch_id]))

    def disconnect(self, websocket: WebSocket, batch_id: str) -> None:
        connections = self.active_connections.get(batch_id, [])
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            self.active_connections.pop(batch_id, None)
        logger.info("WebSocket disconnected", batch_id=batch_id)

    async def broadcast_to_batch(self, batch_id: str, data: dict) -> None:
        """Send a message to all WebSocket clients connected to this batch."""
        connections = self.active_connections.get(batch_id, [])
        dead = []
        for websocket in connections:
            try:
                await websocket.send_text(json.dumps(data))
            except WebSocketDisconnect:
                dead.append(websocket)
            except Exception as e:
                logger.warning("WS send error", error=str(e))
                dead.append(websocket)

        for ws in dead:
            self.disconnect(ws, batch_id)

    async def send_initial_status(self, websocket: WebSocket, batch_id: str) -> None:
        """Send current batch status immediately on connection."""
        try:
            from app.db.session import AsyncSessionFactory
            from app.models.batch import Batch
            from sqlalchemy import select

            async with AsyncSessionFactory() as db:
                result = await db.execute(select(Batch).where(Batch.id == batch_id))
                batch = result.scalar_one_or_none()
                if batch:
                    status_data = {
                        "type": "initial_status",
                        "batch_id": batch_id,
                        "payload": {
                            "status": batch.status.value,
                            "total_sheets": batch.total_sheets,
                            "processed_sheets": batch.processed_sheets,
                            "progress_percent": (
                                batch.processed_sheets / batch.total_sheets * 100
                                if batch.total_sheets > 0 else 0
                            ),
                        },
                    }
                    await websocket.send_text(json.dumps(status_data))
        except Exception as e:
            logger.warning("Could not send initial status", error=str(e))


# Singleton manager
manager = ConnectionManager()


async def redis_pubsub_listener() -> None:
    """
    Background asyncio task that subscribes to Redis pub/sub for all ws:batch:* channels.
    Forwards messages to the ConnectionManager.
    """
    from app.core.config import settings
    import aioredis  # requires redis>=4.2 with asyncio support

    while True:
        try:
            r = await aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            pubsub = r.pubsub()
            await pubsub.psubscribe("ws:batch:*")
            logger.info("Redis pub/sub listener started")

            async for message in pubsub.listen():
                if message["type"] == "pmessage":
                    channel: str = message["channel"]
                    batch_id = channel.split("ws:batch:")[-1]
                    try:
                        data = json.loads(message["data"])
                        await manager.broadcast_to_batch(batch_id, data)
                    except json.JSONDecodeError:
                        pass
        except Exception as e:
            logger.error("Redis pub/sub error, reconnecting in 5s", error=str(e))
            await asyncio.sleep(5)
