from datetime import datetime
from enum import Enum
from typing import Optional

from beanie import Document, Indexed


class AuditStatus(str, Enum):
    success = "success"
    failure = "failure"


class AuditLog(Document):
    """Audit trail entry for user actions"""

    user_id: Indexed(str)
    user_name: str
    action: str
    resource: str
    resource_id: str
    timestamp: Indexed(datetime)
    ip_address: Optional[str] = None
    status: AuditStatus = AuditStatus.success

    class Settings:
        name = "audit_logs"
