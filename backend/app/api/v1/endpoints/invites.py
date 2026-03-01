from datetime import datetime, timezone
from typing import List

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, Query, HTTPException, status

from app.dependancies.auth import get_current_user
from app.models import User
from app.models.invite import Invite
from app.models.users import UserRole
from app.schemas.invite import InviteCreate, InviteResponse

router = APIRouter()

# Roles each caller is allowed to whitelist
_ALLOWED_TO_INVITE: dict[UserRole, list[UserRole]] = {
    UserRole.admin: [UserRole.admin, UserRole.doctor, UserRole.nurse, UserRole.patient],
    UserRole.doctor: [UserRole.patient],
}


def _check_invite_permission(caller: User, target_role: UserRole) -> None:
    allowed = _ALLOWED_TO_INVITE.get(caller.role, [])
    if target_role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You are not allowed to add users with role '{target_role}'",
        )


@router.post("", response_model=InviteResponse, status_code=status.HTTP_201_CREATED)
async def create_invite(
    payload: InviteCreate,
    current_user: User = Depends(get_current_user),
):
    """Add an email to the access whitelist with a specific role."""
    _check_invite_permission(current_user, payload.role)

    # If entry already exists for this email (used or unused), return it / update role
    existing = await Invite.find_one(Invite.email == payload.email)
    if existing:
        if not existing.used:
            # Update role in case admin changed their mind
            existing.role = payload.role
            existing.invited_by_id = str(current_user.id)
            existing.invited_by_name = current_user.full_name or current_user.email
            await existing.save()
            return existing
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{payload.email} has already signed up using a previous access grant.",
            )

    invite = Invite(
        email=payload.email,
        role=payload.role,
        invited_by_id=str(current_user.id),
        invited_by_name=current_user.full_name or current_user.email,
        created_at=datetime.now(timezone.utc),
    )
    await invite.insert()
    return invite


@router.get("", response_model=List[InviteResponse])
async def list_invites(
    current_user: User = Depends(get_current_user),
):
    """List whitelist entries. Admin sees all; doctor sees only their own."""
    if current_user.role == UserRole.admin:
        return await Invite.find_all().sort(-Invite.created_at).to_list()
    elif current_user.role == UserRole.doctor:
        return await Invite.find(Invite.invited_by_id == str(current_user.id)).sort(-Invite.created_at).to_list()
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")


@router.delete("/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_invite(
    invite_id: str,
    current_user: User = Depends(get_current_user),
):
    """Remove an entry from the whitelist. Admin can remove any; doctors can only remove their own."""
    try:
        oid = PydanticObjectId(invite_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invite ID")

    invite = await Invite.get(oid)
    if not invite:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    if current_user.role != UserRole.admin and invite.invited_by_id != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    await invite.delete()


