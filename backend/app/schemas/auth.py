from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.users import UserRole


class UserCreation(BaseModel):
    """Schema for user creation"""
    email: EmailStr = Field(..., description="User's email address")
    password: str
    full_name: Optional[str] = Field(None, description="User's full name")
    date_of_birth: Optional[date] = Field(None, description="User's date of birth")
    role: UserRole = Field(default=UserRole.patient, description="Role of the user")


class UserResponse(BaseModel):
    """Schema for user response (excludes sensitive data)"""
    id: str = Field(..., description="User's unique identifier (UUID)")
    email: EmailStr = Field(..., description="User's email address")
    provider: Optional[str] = Field(None, description="OAuth provider used for authentication")
    avatar: Optional[str] = Field(None, description="Profile image")
    full_name: Optional[str] = Field(None, description="User's full name")
    date_of_birth: Optional[date] = Field(None, description="User's date of birth")
    is_active: Optional[bool] = Field(default=True, description="Whether the user account is active")
    created_at: datetime = Field(..., description="Account creation timestamp")
    role: Optional[UserRole] = Field(default=None, description="Role of the user")
    model_config = ConfigDict(from_attributes=True)

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v) -> str:
        return str(v)


class UserSignIn(BaseModel):
    """Schema for sign-in request"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class MFARequiredResponse(BaseModel):
    """Returned after password verification — client must complete OTP step"""
    mfa_required: bool = True
    email: EmailStr = Field(..., description="Email the OTP was sent to")


class LoginResponse(BaseModel):
    """Returned from /login — either MFA required or direct session (demo users)"""
    mfa_required: bool
    email: EmailStr
    # Present only when mfa_required=False (demo users bypass OTP)
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None
    expires_in: Optional[int] = None
    user: Optional["UserResponse"] = None


class MFAVerifyRequest(BaseModel):
    """Schema for OTP verification"""
    email: EmailStr = Field(..., description="User's email address")
    token: str = Field(..., description="6-digit OTP code from email")


class SignInResponse(BaseModel):
    """Schema for completed sign-in response (after MFA)"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Seconds until access token expires")
    user: UserResponse = Field(..., description="Authenticated user data")


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")


class TokenData(BaseModel):
    """Schema for token payload data"""
    email: Optional[str] = None
    user_id: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""
    refresh_token: str = Field(..., description="The refresh token")


class ProfileUpdate(BaseModel):
    """Schema for updating own profile"""
    full_name: Optional[str] = Field(None, description="User's full name")
    date_of_birth: Optional[date] = Field(None, description="User's date of birth")
