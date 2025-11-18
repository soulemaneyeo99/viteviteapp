"""
ViteviteApp - Security Module
Gestion JWT, hashing passwords, permissions
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status

from app.core.config import settings


# ========== PASSWORD HASHING ==========
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie un mot de passe"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash un mot de passe"""
    return pwd_context.hash(password)


# ========== JWT TOKENS ==========
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Crée un JWT access token
    
    Args:
        data: Données à encoder (généralement {"sub": user_id})
        expires_delta: Durée de validité custom (sinon config par défaut)
    
    Returns:
        Token JWT encodé
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Crée un JWT refresh token (longue durée)
    
    Args:
        data: Données à encoder
    
    Returns:
        Refresh token JWT
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Décode et valide un JWT token
    
    Args:
        token: Token JWT à décoder
    
    Returns:
        Payload du token
    
    Raises:
        HTTPException: Si token invalide/expiré
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e


def create_token_pair(user_id: str) -> Dict[str, str]:
    """
    Crée une paire access + refresh tokens
    
    Args:
        user_id: ID de l'utilisateur
    
    Returns:
        Dict avec access_token et refresh_token
    """
    access_token = create_access_token(data={"sub": user_id})
    refresh_token = create_refresh_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# ========== PASSWORD VALIDATION ==========
def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """
    Valide la force d'un mot de passe
    
    Args:
        password: Mot de passe à valider
    
    Returns:
        (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"
    
    if not any(char.isdigit() for char in password):
        return False, "Le mot de passe doit contenir au moins un chiffre"
    
    if not any(char.isupper() for char in password):
        return False, "Le mot de passe doit contenir au moins une majuscule"
    
    if not any(char.islower() for char in password):
        return False, "Le mot de passe doit contenir au moins une minuscule"
    
    # Optionnel: caractères spéciaux
    # special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    # if not any(char in special_chars for char in password):
    #     return False, "Le mot de passe doit contenir au moins un caractère spécial"
    
    return True, None


# ========== API KEY VALIDATION (FUTURE) ==========
def validate_api_key(api_key: str) -> bool:
    """
    Valide une API key pour accès externe
    (À implémenter selon besoins futurs)
    """
    # TODO: Implémenter validation API keys en base
    return False


# ========== PERMISSIONS (SIMPLE RBAC) ==========
class Permission:
    """Permissions basiques pour le système"""
    
    # User permissions
    READ_OWN_TICKETS = "read:own_tickets"
    CREATE_TICKETS = "create:tickets"
    CANCEL_OWN_TICKETS = "cancel:own_tickets"
    
    # Admin permissions
    READ_ALL_TICKETS = "read:all_tickets"
    MANAGE_TICKETS = "manage:tickets"
    MANAGE_SERVICES = "manage:services"
    VIEW_ANALYTICS = "view:analytics"
    MANAGE_USERS = "manage:users"
    
    # Super admin
    FULL_ACCESS = "admin:full"


def check_permission(user_permissions: list[str], required_permission: str) -> bool:
    """
    Vérifie si l'utilisateur a la permission requise
    
    Args:
        user_permissions: Liste des permissions de l'utilisateur
        required_permission: Permission requise
    
    Returns:
        True si autorisé
    """
    # Super admin a tous les droits
    if Permission.FULL_ACCESS in user_permissions:
        return True
    
    return required_permission in user_permissions


# ========== UTILITIES ==========
def generate_api_key() -> str:
    """Génère une API key sécurisée"""
    import secrets
    return f"vva_{secrets.token_urlsafe(32)}"


def mask_sensitive_data(data: str, visible_chars: int = 4) -> str:
    """
    Masque les données sensibles pour les logs
    
    Example:
        mask_sensitive_data("my_secret_key_123") -> "my_s***"
    """
    if len(data) <= visible_chars:
        return "*" * len(data)
    
    return data[:visible_chars] + "*" * (len(data) - visible_chars)