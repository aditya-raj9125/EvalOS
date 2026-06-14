"""
Gemini AI client with JSON extraction, retry logic, and custom exceptions.
"""

import base64
import json
import re
from typing import Any

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class GeminiAPIError(Exception):
    """Raised when Gemini API call fails."""
    pass


class GeminiJSONParseError(Exception):
    """Raised when Gemini response cannot be parsed as JSON after retries."""
    pass


class GeminiClient:
    """
    Wrapper around Gemini 1.5 Flash.
    Temperature=0.1 for consistent evaluation results.
    """

    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                top_p=0.95,
                max_output_tokens=8192,
            ),
        )

    def _strip_code_fences(self, text: str) -> str:
        """Remove markdown code fences from Gemini response."""
        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```\s*", "", text)
        return text.strip()

    def generate_text(self, prompt: str) -> str:
        """Send a text-only prompt to Gemini. Returns response text."""
        import time
        for attempt in range(5):
            try:
                response = self.model.generate_content(prompt)
                return response.text
            except google_exceptions.ResourceExhausted as e:
                if attempt == 4:
                    logger.error("Gemini rate limit hit permanently", error=str(e))
                    raise GeminiAPIError(f"Rate limit: {e}") from e
                wait_time = 10 * (2 ** attempt)
                logger.warning(f"Gemini rate limit hit, retrying in {wait_time}s", error=str(e))
                time.sleep(wait_time)
            except google_exceptions.ServiceUnavailable as e:
                logger.error("Gemini service unavailable", error=str(e))
                raise GeminiAPIError(f"Service unavailable: {e}") from e
            except google_exceptions.InvalidArgument as e:
                logger.error("Gemini invalid argument", error=str(e))
                raise GeminiAPIError(f"Invalid argument: {e}") from e
            except Exception as e:
                logger.error("Gemini unexpected error", error=str(e))
                raise GeminiAPIError(str(e)) from e

    def generate_with_image(self, prompt: str, base64_image_string: str) -> str:
        """Send a prompt with an inline JPEG image. Returns response text."""
        import time
        for attempt in range(5):
            try:
                image_bytes = base64.b64decode(base64_image_string)
                image_part = {"mime_type": "image/jpeg", "data": image_bytes}
                content_parts = [image_part, prompt]
                response = self.model.generate_content(content_parts)
                return response.text
            except google_exceptions.ResourceExhausted as e:
                if attempt == 4:
                    logger.error("Gemini rate limit hit (vision) permanently", error=str(e))
                    raise GeminiAPIError(f"Rate limit: {e}") from e
                wait_time = 10 * (2 ** attempt)
                logger.warning(f"Gemini rate limit hit (vision), retrying in {wait_time}s", error=str(e))
                time.sleep(wait_time)
            except google_exceptions.ServiceUnavailable as e:
                logger.error("Gemini service unavailable (vision)", error=str(e))
                raise GeminiAPIError(f"Service unavailable: {e}") from e
            except google_exceptions.InvalidArgument as e:
                logger.error("Gemini invalid argument (vision)", error=str(e))
                raise GeminiAPIError(f"Invalid argument (image may be too large): {e}") from e
            except Exception as e:
                logger.error("Gemini vision unexpected error", error=str(e))
                raise GeminiAPIError(str(e)) from e

    def generate_json(
        self, prompt: str, image: str | None = None
    ) -> Any:
        """
        Call Gemini and parse response as JSON.
        Retries once with corrective instruction if JSON parsing fails.
        Raises GeminiJSONParseError if both attempts fail.
        """
        for attempt in range(2):
            try:
                current_prompt = prompt
                if attempt == 1:
                    current_prompt += (
                        "\n\nIMPORTANT: Your previous response was not valid JSON. "
                        "Respond with ONLY a valid JSON object or array, "
                        "no text before or after."
                    )

                if image:
                    raw = self.generate_with_image(current_prompt, image)
                else:
                    raw = self.generate_text(current_prompt)

                cleaned = self._strip_code_fences(raw)
                return json.loads(cleaned)
            except json.JSONDecodeError as e:
                if attempt == 0:
                    logger.warning("JSON parse failed, retrying", error=str(e))
                    continue
                else:
                    logger.error("JSON parse failed after retry", raw_response=raw[:500])
                    raise GeminiJSONParseError(
                        f"Could not parse Gemini response as JSON: {e}"
                    ) from e
