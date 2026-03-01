from datetime import date, datetime
from enum import Enum
from typing import Optional

from beanie import Document, Indexed


class PrescriptionStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    completed = "completed"


class Prescription(Document):
    """Prescription issued to a patient"""

    patient_id: Indexed(str)
    medication: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    prescribed_by: str
    prescribed_by_id: Optional[str] = None
    status: PrescriptionStatus = PrescriptionStatus.active
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Settings:
        name = "prescriptions"
