from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.prescription import PrescriptionStatus


class PrescriptionCreate(BaseModel):
    patient_id: Optional[str] = None       # set from URL path
    medication: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    prescribed_by: Optional[str] = None   # set from current_user server-side
    prescribed_by_id: Optional[str] = None
    status: PrescriptionStatus = PrescriptionStatus.active

    @field_validator("end_date", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v


class PrescriptionResponse(BaseModel):
    id: str = Field(..., description="Prescription unique identifier")
    patient_id: str
    medication: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    prescribed_by: str
    prescribed_by_id: Optional[str] = None
    status: PrescriptionStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v) -> str:
        return str(v)
