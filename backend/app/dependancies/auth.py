from typing import List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase_auth.errors import AuthApiError

from app.core.supabase import supabase_client
from app.models import User
from app.models.users import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    try:
        response = supabase_client.auth.get_user(token)
    except AuthApiError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    supabase_user = response.user
    if not supabase_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    user = await User.find_one(User.auth_id == supabase_user.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    return user


def require_roles(allowed_roles: List[UserRole]):
    """Factory that returns a dependency requiring one of the given roles."""
    def _check(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted to: {', '.join(r.value for r in allowed_roles)}",
            )
        return user
    return _check


# Convenience role guards
require_admin = require_roles([UserRole.admin])
require_doctor = require_roles([UserRole.doctor])
require_nurse = require_roles([UserRole.nurse])
require_patient = require_roles([UserRole.patient])
require_medical_staff = require_roles([UserRole.doctor, UserRole.nurse])
require_clinical = require_roles([UserRole.doctor, UserRole.nurse, UserRole.admin])
