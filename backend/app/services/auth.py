from datetime import datetime, timezone

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError
from supabase_auth.errors import AuthApiError

from app.core.supabase import supabase_client
from app.models import User
from app.models.invite import Invite
from app.models.users import UserRole

# ALL roles require a whitelist entry — no open signup
_INVITE_REQUIRED_ROLES = {UserRole.admin, UserRole.doctor, UserRole.nurse, UserRole.patient}


async def _consume_invite(email: str) -> UserRole:
    """Look up whitelist entry by email, mark it used, and return the assigned role. Raises 403 if not found."""
    invite = await Invite.find_one(
        Invite.email == email,
        Invite.used == False,
    )
    if not invite:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your email is not on the access list. Please contact your administrator.",
        )
    invite.used = True
    await invite.save()
    return invite.role


async def _bypass_invite_create_admin(email: str, password: str, full_name: str) -> User:
    """Create the first admin user bypassing the invite system. Used only by the bootstrap endpoint."""
    existing = await User.find_one(User.email == email)
    if existing:
        return existing

    try:
        new_supabase_user = supabase_client.auth.sign_up({
            'email': email,
            'password': password,
        })
    except AuthApiError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    user = User(
        auth_id=new_supabase_user.user.id,
        email=email,
        provider="email",
        avatar=None,
        full_name=full_name,
        role=UserRole.admin,
        created_at=datetime.now(timezone.utc),
    )
    try:
        await user.insert()
    except DuplicateKeyError:
        return await User.find_one(User.email == email)
    return user


async def create_user(data):
    # Role is always determined by the whitelist entry — never trusted from the client
    role = await _consume_invite(data.email)

    existing_user = await User.find_one(User.email == data.email)
    if existing_user:
        return existing_user

    try:
        new_user = supabase_client.auth.sign_up({
            'email': data.email,
            'password': data.password,
        })
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    user = User(
        auth_id=new_user.user.id,
        email=data.email,
        provider="email",
        avatar="https://media.tenor.com/fcpZR8QekOoAAAAM/monkey%27s-middle-finger.gif",
        full_name=data.full_name,
        date_of_birth=data.date_of_birth if hasattr(data, 'date_of_birth') else None,
        role=role,
        created_at=datetime.now(timezone.utc),
    )

    try:
        await user.insert()
    except DuplicateKeyError:
        existing_user_by_auth_id = await User.find_one(User.auth_id == new_user.user.id)
        if existing_user_by_auth_id:
            return existing_user_by_auth_id
        return await User.find_one(User.email == data.email)

    return user


async def sign_in_user(email: str, password: str):
    # Reject login attempts for emails not registered in our system
    db_user = await User.find_one(User.email == email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with that email. Please contact your administrator to get access.",
        )
    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact your administrator.",
        )

    try:
        supabase_client.auth.sign_in_with_password({
            'email': email,
            'password': password,
        })
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    # Password verified — send OTP as second factor
    try:
        supabase_client.auth.sign_in_with_otp({
            'email': email,
            'options': {'should_create_user': False},
        })
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP: {str(e)}",
        )

    return {"mfa_required": True, "email": email}


async def verify_mfa(email: str, token: str):
    try:
        result = supabase_client.auth.verify_otp({
            'email': email,
            'token': token,
            'type': 'email',
        })
    except AuthApiError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    user = await User.find_one(User.auth_id == result.user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    return {
        "access_token": result.session.access_token,
        "refresh_token": result.session.refresh_token,
        "token_type": "bearer",
        "expires_in": result.session.expires_in,
        "user": user,
    }

