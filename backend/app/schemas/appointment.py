from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.appointment import AppointmentStatus, AppointmentType


class AppointmentCreate(BaseModel):
    patient_id: Optional[str] = None  # set from URL path
    title: str
    appointment_type: AppointmentType = AppointmentType.consultation
    date: date
    time: str
    notes: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None

    @field_validator("notes", "location", "department", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        return None if v == "" else v


class AppointmentUpdate(BaseModel):
    title: Optional[str] = None
    appointment_type: Optional[AppointmentType] = None
    date: Optional[date] = None
    time: Optional[str] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: str = Field(..., description="Appointment unique identifier")
    patient_id: str
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    title: str
    appointment_type: AppointmentType
    date: date
    time: str
    status: AppointmentStatus
    notes: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("id", mode="before")
    @classmethod
    def coerce_id(cls, v) -> str:
        return str(v)
