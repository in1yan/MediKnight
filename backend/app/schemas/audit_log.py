from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.audit_log import AuditStatus


class AuditLogCreate(BaseModel):
    user_id: str
    user_name: str
    action: str
    resource: str
    resource_id: str
    ip_address: Optional[str] = None
    status: AuditStatus = AuditStatus.success


class AuditLogResponse(BaseModel):
    id: str = Field(..., description="Audit log unique identifier")
    user_id: str
    user_name: str
    action: str
    resource: str
    resource_id: str
    timestamp: datetime
    ip_address: Optional[str] = None
    status: AuditStatus

    model_config = ConfigDict(from_attributes=True)

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v) -> str:
        return str(v)
