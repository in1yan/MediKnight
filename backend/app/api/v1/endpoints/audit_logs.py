from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status

from app.dependancies.auth import get_current_user, require_admin
from app.models import User
from app.models.audit_log import AuditLog, AuditStatus
from app.schemas.audit_log import AuditLogCreate, AuditLogResponse

router = APIRouter()


@router.get("", response_model=List[AuditLogResponse])
async def list_audit_logs(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    action: Optional[str] = Query(None, description="Filter by action"),
    resource: Optional[str] = Query(None, description="Filter by resource type"),
    log_status: Optional[AuditStatus] = Query(None, alias="status", description="Filter by status"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    _: User = Depends(require_admin),
):
    """List audit logs with optional filters. Admin only."""
    query = {}
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    if resource:
        query["resource"] = resource
    if log_status:
        query["status"] = log_status

    logs = (
        await AuditLog.find(query)
        .sort(-AuditLog.timestamp)
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return logs


@router.post("", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def create_audit_log(
    payload: AuditLogCreate,
    current_user: User = Depends(get_current_user),
):
    """Record an audit log entry. Any authenticated user."""
    log = AuditLog(
        **payload.model_dump(),
        timestamp=datetime.now(timezone.utc),
    )
    await log.insert()
    return log
