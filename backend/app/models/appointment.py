from datetime import date, datetime
from enum import Enum
from typing import Optional

from beanie import Document, Indexed


class AppointmentStatus(str, Enum):
    scheduled = "scheduled"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class AppointmentType(str, Enum):
    consultation = "consultation"
    follow_up = "follow_up"
    lab = "lab"
    imaging = "imaging"
    procedure = "procedure"
    emergency = "emergency"


class Appointment(Document):
    """Appointment between patient and doctor"""

    patient_id: Indexed(str)
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    title: str
    appointment_type: AppointmentType = AppointmentType.consultation
    date: date
    time: str  # HH:MM string
    status: AppointmentStatus = AppointmentStatus.scheduled
    notes: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Settings:
        name = "appointments"
