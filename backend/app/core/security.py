"""
ViteviteApp - Security Module
Gestion JWT, hashing passwords, permissions
Version Async compatible FastAPI
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.database import get_async_db  # fonction qui renvoie AsyncSession
from app.models.user import User

# ========= PASSWORD HASHING =========
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# ========= JWT TOKENS =========
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


def create_token_pair(user_id: str) -> Dict[str, str]:
    return {
        "access_token": create_access_token({"sub": user_id}),
        "refresh_token": create_refresh_token({"sub": user_id}),
        "token_type": "bearer",
    }


# ========= PASSWORD VALIDATION =========
def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"
    if not any(char.isdigit() for char in password):
        return False, "Le mot de passe doit contenir au moins un chiffre"
    if not any(char.isupper() for char in password):
        return False, "Le mot de passe doit contenir au moins une majuscule"
    if not any(char.islower() for char in password):
        return False, "Le mot de passe doit contenir au moins une minuscule"
    return True, None


# ========= PERMISSIONS =========
class Permission:
    READ_OWN_TICKETS = "read:own_tickets"
    CREATE_TICKETS = "create:tickets"
    CANCEL_OWN_TICKETS = "cancel:own_tickets"

    READ_ALL_TICKETS = "read:all_tickets"
    MANAGE_TICKETS = "manage:tickets"
    MANAGE_SERVICES = "manage:services"
    VIEW_ANALYTICS = "view:analytics"
    MANAGE_USERS = "manage:users"

    FULL_ACCESS = "admin:full"


def check_permission(user_permissions: list[str], required_permission: str) -> bool:
    if Permission.FULL_ACCESS in user_permissions:
        return True
    return required_permission in user_permissions


# ========= UTILITIES =========
def generate_api_key() -> str:
    return f"vva_{secrets.token_urlsafe(32)}"


def mask_sensitive_data(data: str, visible_chars: int = 4) -> str:
    if len(data) <= visible_chars:
        return "*" * len(data)
    return data[:visible_chars] + "*" * (len(data) - visible_chars)


# ========= USER HELPERS (ASYNC) =========
async def get_user(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


# ========= FASTAPI DEPENDENCIES =========
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_async_db)
) -> User:
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return user
