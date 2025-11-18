"""
ViteviteApp - FastAPI Dependencies
Dépendances réutilisables pour authentification et permissions
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole
from app.crud.user import user_crud


# ========== SECURITY ==========
security = HTTPBearer(auto_error=False)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    """
    Récupère l'utilisateur actuel depuis le token JWT
    Retourne None si pas de token (utilisateur anonyme)
    
    Usage:
        @router.get("/endpoint")
        async def endpoint(current_user: User = Depends(get_current_user)):
            ...
    """
    if not credentials:
        return None
    
    try:
        payload = decode_token(credentials.credentials)
        user_id: str = payload.get("sub")
        
        if not user_id:
            return None
        
        user = await user_crud.get(db, id=user_id)
        return user
    
    except Exception:
        return None


async def get_current_active_user(
    current_user: Optional[User] = Depends(get_current_user)
) -> User:
    """
    Récupère l'utilisateur actuel et vérifie qu'il est actif
    Lève une exception si pas authentifié ou inactif
    
    Usage:
        @router.get("/protected")
        async def protected(user: User = Depends(get_current_active_user)):
            ...
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non authentifié",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utilisateur inactif"
        )
    
    return current_user


async def get_current_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Vérifie que l'utilisateur est admin
    
    Usage:
        @router.get("/admin-only")
        async def admin_only(admin: User = Depends(get_current_admin)):
            ...
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissions administrateur requises"
        )
    
    return current_user


async def get_current_super_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Vérifie que l'utilisateur est super admin
    
    Usage:
        @router.delete("/critical")
        async def critical(admin: User = Depends(get_current_super_admin)):
            ...
    """
    if not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissions super administrateur requises"
        )
    
    return current_user


# ========== OPTIONAL AUTH ==========
async def get_optional_user(
    current_user: Optional[User] = Depends(get_current_user)
) -> Optional[User]:
    """
    Récupère l'utilisateur s'il est authentifié, sinon None
    Utile pour endpoints accessibles avec ou sans auth
    
    Usage:
        @router.get("/public-or-private")
        async def endpoint(user: Optional[User] = Depends(get_optional_user)):
            if user:
                # Logged in
            else:
                # Anonymous
    """
    return current_user