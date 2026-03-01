from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from app.dependancies.auth import require_admin
from app.models import User
from app.models.audit_log import AuditLog, AuditStatus
from app.models.users import UserRole
from app.schemas.auth import UserResponse
from pydantic import BaseModel

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    total_users: int
    patients: int
    doctors: int
    nurses: int
    admins: int
    total_audit_logs: int
    failed_logins: int  # lifetime failed login events


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(_: User = Depends(require_admin)):
    """Aggregate stats for the admin dashboard. Admin only."""
    all_users = await User.find_all().to_list()
    counts = {role: 0 for role in UserRole}
    for u in all_users:
        counts[u.role] += 1

    total_logs = await AuditLog.count()
    failed = await AuditLog.find(AuditLog.status == AuditStatus.failure).count()

    return AdminStats(
        total_users=len(all_users),
        patients=counts[UserRole.patient],
        doctors=counts[UserRole.doctor],
        nurses=counts[UserRole.nurse],
        admins=counts[UserRole.admin],
        total_audit_logs=total_logs,
        failed_logins=failed,
    )


@router.get("/users", response_model=List[UserResponse])
async def list_all_users(
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    _: User = Depends(require_admin),
):
    """List all users with optional role filter. Admin only."""
    query = User.find()
    if role:
        query = User.find(User.role == role)
    users = await query.skip(skip).limit(limit).to_list()
    return users
