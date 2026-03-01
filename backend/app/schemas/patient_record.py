from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.patient_record import RecordType


class PatientRecordCreate(BaseModel):
    patient_id: Optional[str] = None  # set from URL path, not required in body
    type: RecordType
    title: str
    description: str
    date: date
    provider: str
    created_by_id: Optional[str] = None


class PatientRecordUpdate(BaseModel):
    type: Optional[RecordType] = None
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    provider: Optional[str] = None


class PatientRecordResponse(BaseModel):
    id: str = Field(..., description="Record unique identifier")
    patient_id: str
    type: RecordType
    title: str
    description: str
    date: date
    provider: str
    created_by_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v) -> str:
        return str(v)
