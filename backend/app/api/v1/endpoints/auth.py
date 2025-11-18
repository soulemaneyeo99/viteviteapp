"""
ViteviteApp - Authentication Endpoints
Login, register, refresh token, etc.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_token_pair, decode_token
from app.crud.user import user_crud
from app.schemas.user import (
    UserRegister,
    UserLogin,
    LoginResponse,
    UserResponse,
    Token,
    UserPublic
)
from app.utils.dependencies import get_current_active_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """
    📝 **Créer un nouveau compte utilisateur**
    
    - **email**: Email unique (format valide)
    - **password**: Minimum 8 caractères avec majuscule, minuscule, chiffre
    - **full_name**: Nom complet (optionnel)
    - **phone**: Numéro ivoirien format +225XXXXXXXXXX (optionnel)
    
    Returns:
        - Tokens JWT (access + refresh)
        - Données utilisateur
    """
    # Vérifier si email existe déjà
    existing_user = await user_crud.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )
    
    # Vérifier si téléphone existe déjà
    if user_in.phone:
        existing_phone = await user_crud.get_by_phone(db, phone=user_in.phone)
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce numéro de téléphone est déjà utilisé"
            )
    
    # Créer l'utilisateur
    user = await user_crud.create(db, obj_in=user_in)
    await db.commit()
    
    # Générer les tokens
    tokens = create_token_pair(user.id)
    
    return LoginResponse(
        success=True,
        message="Compte créé avec succès",
        tokens=Token(**tokens),
        user=UserPublic.model_validate(user)
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    🔐 **Se connecter**
    
    - **email**: Email du compte
    - **password**: Mot de passe
    
    Returns:
        - Tokens JWT (access + refresh)
        - Données utilisateur
    """
    # Authentifier l'utilisateur
    user = await user_crud.authenticate(
        db,
        email=credentials.email,
        password=credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé. Contactez le support."
        )
    
    # Mettre à jour last_login
    await user_crud.update_last_login(db, user=user)
    await db.commit()
    
    # Générer les tokens
    tokens = create_token_pair(user.id)
    
    return LoginResponse(
        success=True,
        message="Connexion réussie",
        tokens=Token(**tokens),
        user=UserPublic.model_validate(user)
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    🔄 **Rafraîchir le token d'accès**
    
    - **refresh_token**: Token de refresh valide
    
    Returns:
        - Nouveaux tokens JWT
    """
    try:
        # Décoder le refresh token
        payload = decode_token(refresh_token)
        
        # Vérifier le type de token
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide"
            )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide"
            )
        
        # Vérifier que l'utilisateur existe et est actif
        user = await user_crud.get(db, id=user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur introuvable ou inactif"
            )
        
        # Générer de nouveaux tokens
        tokens = create_token_pair(user.id)
        
        return Token(**tokens)
    
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré"
        )


@router.get("/me", response_model=UserPublic)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    👤 **Obtenir les informations du compte actuel**
    
    Nécessite une authentification JWT valide.
    
    Returns:
        - Données de l'utilisateur connecté
    """
    return UserPublic.model_validate(current_user)


@router.post("/logout", response_model=dict)
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    """
    🚪 **Se déconnecter**
    
    Note: Avec JWT, la déconnexion est côté client (suppression du token).
    Ce endpoint est principalement informatif.
    
    Pour une vraie invalidation, implémenter une blacklist Redis.
    """
    return {
        "success": True,
        "message": "Déconnexion réussie. Supprimez le token côté client."
    }


@router.post("/verify-email", response_model=UserResponse)
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    ✅ **Vérifier l'email** (Future feature)
    
    À implémenter: envoi email avec token de vérification
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Fonctionnalité en cours de développement"
    )


@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """
    🔑 **Mot de passe oublié** (Future feature)
    
    À implémenter: envoi email avec lien de réinitialisation
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Fonctionnalité en cours de développement"
    )