"""
ViteviteApp - User Schemas
Validation Pydantic v2 pour les utilisateurs
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

from app.models.user import UserRole


# ========== BASE SCHEMAS ==========
class UserBase(BaseModel):
    """Base schema pour User"""
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?225\d{10}$")  # Format CI


class UserCreate(UserBase):
    """Schema pour création d'utilisateur"""
    password: str = Field(..., min_length=8, max_length=100)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Valide la force du mot de passe"""
        if not any(char.isdigit() for char in v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        if not any(char.isupper() for char in v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        if not any(char.islower() for char in v):
            raise ValueError('Le mot de passe doit contenir au moins une minuscule')
        return v


class UserUpdate(BaseModel):
    """Schema pour mise à jour d'utilisateur"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)


class UserInDB(UserBase):
    """Schema User depuis DB"""
    id: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[str] = None
    
    model_config = {"from_attributes": True}


class UserPublic(BaseModel):
    """Schema User public (sans infos sensibles)"""
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole
    created_at: datetime
    
    model_config = {"from_attributes": True}


# ========== AUTH SCHEMAS ==========
class UserLogin(BaseModel):
    """Schema pour login"""
    email: EmailStr
    password: str


class UserRegister(UserCreate):
    """Schema pour enregistrement (alias de UserCreate)"""
    pass


class Token(BaseModel):
    """Schema pour tokens JWT"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Schema pour payload du token"""
    sub: str  # user_id
    exp: int
    iat: int
    type: str  # "access" ou "refresh"


# ========== RESPONSE SCHEMAS ==========
class UserResponse(BaseModel):
    """Response standard pour opérations User"""
    success: bool
    message: str
    user: Optional[UserPublic] = None


class LoginResponse(BaseModel):
    """Response pour login"""
    success: bool
    message: str
    tokens: Token
    user: UserPublic