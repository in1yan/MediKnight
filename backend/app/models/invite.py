from datetime import datetime

import pymongo
from beanie import Document
from pydantic import EmailStr

from app.models.users import UserRole


class Invite(Document):
    """Pre-authorized email+role whitelist entry. When the matching email signs up, the role is assigned automatically."""

    email: EmailStr
    role: UserRole
    invited_by_id: str
    invited_by_name: str
    created_at: datetime
    used: bool = False

    class Settings:
        name = "invites"
        indexes = [
            pymongo.IndexModel([("email", pymongo.ASCENDING)], name="invite_email_unique", unique=True),
        ]
