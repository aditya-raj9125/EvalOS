"""
JWT authentication and password hashing utilities.
Uses passlib bcrypt + python-jose JWT.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

import bcrypt

def hash_password(plain_password: str) -> str:
    """Hash a plain text password using bcrypt."""
    salt = bcrypt.gensalt()
    pwd_bytes = plain_password.encode('utf-8')
    return bcrypt.hashpw(pwd_bytes, salt).decode('ascii')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against its bcrypt hash."""
    pwd_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('ascii')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)


def create_access_token(user_id: str, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.
    Default expiry: settings.ACCESS_TOKEN_EXPIRE_MINUTES.
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.now(timezone.utc) + expires_delta
    payload: dict[str, Any] = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode a JWT access token.
    Raises JWTError if invalid or expired.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
