"""
Redis token bucket rate limiter for Gemini API calls.
Capacity = GEMINI_RPM_LIMIT (default 12).
Tokens refill at 1 per 5 seconds.
All Gemini calls must call await rate_limiter.acquire() before calling the API.
"""

import asyncio
import time
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class GeminiRateLimiter:
    """
    Redis-based token bucket rate limiter for Gemini API calls.
    Uses a single Redis key per process; for multi-worker setups, Redis
    ensures cross-process coordination.
    """

    BUCKET_KEY = "gemini:rate_limiter:tokens"
    LAST_REFILL_KEY = "gemini:rate_limiter:last_refill"

    def __init__(self):
        self._redis = None
        self.capacity = settings.GEMINI_RPM_LIMIT  # 12
        self.refill_interval = 60.0 / self.capacity  # seconds per token (5s)

    def _get_redis(self):
        if self._redis is None:
            import redis as redis_lib
            self._redis = redis_lib.from_url(settings.REDIS_URL, decode_responses=True)
        return self._redis

    async def acquire(self) -> None:
        """
        Block until a Gemini API token is available.
        Uses Redis for cross-worker coordination.
        """
        while True:
            try:
                r = self._get_redis()
                # Refill tokens based on elapsed time
                now = time.time()
                last_refill = float(r.get(self.LAST_REFILL_KEY) or now)
                elapsed = now - last_refill
                tokens_to_add = int(elapsed / self.refill_interval)

                if tokens_to_add > 0:
                    current = int(r.get(self.BUCKET_KEY) or 0)
                    new_tokens = min(self.capacity, current + tokens_to_add)
                    pipe = r.pipeline()
                    pipe.set(self.BUCKET_KEY, new_tokens)
                    pipe.set(self.LAST_REFILL_KEY, now)
                    pipe.execute()

                # Try to consume a token
                result = r.decr(self.BUCKET_KEY)
                if result >= 0:
                    logger.debug("Gemini token acquired", remaining=result)
                    return
                else:
                    # No tokens available — put it back and wait
                    r.incr(self.BUCKET_KEY)
                    wait_time = self.refill_interval
                    logger.info(
                        "Gemini rate limit reached, waiting",
                        wait_seconds=wait_time,
                    )
                    await asyncio.sleep(wait_time)
            except Exception as e:
                # If Redis is unavailable, fall back to simple sleep
                logger.warning("Rate limiter Redis error, using fallback sleep", error=str(e))
                await asyncio.sleep(self.refill_interval)
                return

    def initialize(self) -> None:
        """Seed the bucket with full capacity on startup."""
        try:
            r = self._get_redis()
            r.set(self.BUCKET_KEY, self.capacity)
            r.set(self.LAST_REFILL_KEY, time.time())
            logger.info("Rate limiter initialized", capacity=self.capacity)
        except Exception as e:
            logger.warning("Could not initialize rate limiter", error=str(e))


# Singleton
rate_limiter = GeminiRateLimiter()
