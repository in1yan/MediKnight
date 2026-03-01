from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel, EmailStr
from supabase_auth.errors import AuthApiError
from app.core.supabase import supabase_client
from app.core.config import settings
from app.models import User
from app.models.users import UserRole

from app.schemas.auth import (
    UserResponse, UserCreation, UserSignIn,
    SignInResponse, MFARequiredResponse, MFAVerifyRequest,
    RefreshTokenRequest,
)
from app.services.auth import create_user, sign_in_user, verify_mfa, _bypass_invite_create_admin

router = APIRouter()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def auth_signup(newUser: UserCreation):
    user = await create_user(newUser)
    return user


@router.post("/login", response_model=MFARequiredResponse, status_code=status.HTTP_200_OK)
async def auth_login(credentials: UserSignIn):
    return await sign_in_user(credentials.email, credentials.password)


@router.post("/mfa/verify", response_model=SignInResponse, status_code=status.HTTP_200_OK)
async def auth_mfa_verify(body: MFAVerifyRequest):
    return await verify_mfa(body.email, body.token)

@router.post("/token")
async def get_access_token(token_request: RefreshTokenRequest):
    if not token_request.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing"
        )

    try:
        session = supabase_client.auth.refresh_session(token_request.refresh_token)

        if not session or not session.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not refresh session",
            )

        return {
            "access_token": session.session.access_token,
            "refresh_token": session.session.refresh_token,
            "token_type": "Bearer",
            "expires_in": session.session.expires_in,
        }
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {e}"
        )

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"detail": "Logged out"}


# ─── Bootstrap endpoint ───────────────────────────────────────────────────────
# Creates the very first admin account.
# Only works when:
#   1. BOOTSTRAP_SECRET env var is set (non-empty)
#   2. The correct secret is provided in the request
#   3. No admin user exists yet in the database
# Usage: POST /api/v1/auth/bootstrap-admin
# Body: { "secret": "...", "email": "...", "password": "...", "full_name": "..." }

class BootstrapAdminRequest(BaseModel):
    secret: str
    email: EmailStr
    password: str
    full_name: str


@router.post("/bootstrap-admin", status_code=status.HTTP_201_CREATED)
async def bootstrap_admin(body: BootstrapAdminRequest):
    if not settings.BOOTSTRAP_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bootstrap endpoint is disabled. Set BOOTSTRAP_SECRET in environment to enable it.",
        )
    if body.secret != settings.BOOTSTRAP_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid bootstrap secret.",
        )
    existing_admin = await User.find_one(User.role == UserRole.admin)
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An admin account already exists. Use the invite system to add more admins.",
        )
    user = await _bypass_invite_create_admin(
        email=body.email,
        password=body.password,
        full_name=body.full_name,
    )
    return {"message": "Admin account created successfully.", "email": user.email}
