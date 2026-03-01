from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.users import UserRole


class InviteCreate(BaseModel):
    email: EmailStr
    role: UserRole


class InviteResponse(BaseModel):
    id: str = Field(..., description="Invite unique identifier")
    email: str
    role: UserRole
    invited_by_id: str
    invited_by_name: str
    created_at: datetime
    used: bool

    model_config = ConfigDict(from_attributes=True)

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v) -> str:
        return str(v)
