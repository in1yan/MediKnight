from datetime import date, datetime
from enum import Enum
from typing import Optional

from beanie import Document, Indexed
from pydantic import EmailStr


class UserRole(str, Enum):
    admin = "admin"
    doctor = "doctor"
    patient = "patient"
    nurse = "nurse"


class User(Document):
    """User Model"""

    auth_id: Indexed(str, unique=True)
    email: Indexed(EmailStr, unique=True)
    provider: Optional[str] = None
    avatar: Optional[str] = None
    full_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    is_active: Optional[bool] = True
    is_demo: bool = False
    created_at: datetime
    role: UserRole

    class Settings:
        name = "users"
