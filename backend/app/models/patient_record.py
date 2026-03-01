from datetime import date, datetime
from enum import Enum
from typing import Optional

from beanie import Document, Indexed
from pydantic import Field


class RecordType(str, Enum):
    diagnosis = "diagnosis"
    lab = "lab"
    imaging = "imaging"
    vital = "vital"
    note = "note"


class PatientRecord(Document):
    """Medical record for a patient"""

    patient_id: Indexed(str)
    type: RecordType
    title: str
    description: str
    date: date
    provider: str
    created_by_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Settings:
        name = "patient_records"
