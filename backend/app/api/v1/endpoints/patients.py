from datetime import datetime, timezone
from typing import List, Optional

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependancies.auth import (
    get_current_user,
    require_admin,
    require_clinical,
    require_doctor,
    require_medical_staff,
)
from app.models import User
from app.models.appointment import Appointment
from app.models.patient_record import PatientRecord
from app.models.prescription import Prescription
from app.models.users import UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from app.schemas.auth import ProfileUpdate, UserResponse
from app.schemas.patient_record import PatientRecordCreate, PatientRecordResponse, PatientRecordUpdate
from app.schemas.prescription import PrescriptionCreate, PrescriptionResponse

router = APIRouter()


# ─── Helpers ────────────────────────────────────────────────────────────────

def _require_patient_access(patient_id: str, current_user: User) -> None:
    """Allow access if the user is the patient themselves OR clinical staff/admin."""
    if current_user.role == UserRole.patient and str(current_user.id) != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own data",
        )


async def _get_patient_or_404(patient_id: str) -> User:
    try:
        oid = PydanticObjectId(patient_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid patient ID")
    patient = await User.get(oid)
    if not patient or patient.role != UserRole.patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


# ─── Patient list / profile ──────────────────────────────────────────────────

@router.get("", response_model=List[UserResponse])
async def list_patients(
    current_user: User = Depends(require_clinical),
):
    """List all patients. Accessible by admin, doctor, nurse."""
    patients = await User.find(User.role == UserRole.patient).to_list()
    return patients


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """Get the authenticated user's own profile."""
    return current_user


@router.get("/{patient_id}", response_model=UserResponse)
async def get_patient(
    patient_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a patient by ID.
    - Patient: only their own profile
    - Doctor / Nurse / Admin: any patient
    """
    _require_patient_access(patient_id, current_user)
    return await _get_patient_or_404(patient_id)


# ─── Medical Records ─────────────────────────────────────────────────────────

@router.get("/{patient_id}/records", response_model=List[PatientRecordResponse])
async def list_records(
    patient_id: str,
    current_user: User = Depends(get_current_user),
):
    """List medical records for a patient.
    - Patient: only their own records
    - Doctor / Nurse / Admin: any patient
    """
    _require_patient_access(patient_id, current_user)
    await _get_patient_or_404(patient_id)
    records = await PatientRecord.find(PatientRecord.patient_id == patient_id).to_list()
    return records


@router.post(
    "/{patient_id}/records",
    response_model=PatientRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_record(
    patient_id: str,
    payload: PatientRecordCreate,
    current_user: User = Depends(require_medical_staff),
):
    """Create a medical record for a patient. Doctors and nurses (vitals/notes)."""
    await _get_patient_or_404(patient_id)
    record = PatientRecord(
        **payload.model_dump(exclude={"patient_id", "created_by_id"}),
        patient_id=patient_id,
        created_by_id=str(current_user.id),
        created_at=datetime.now(timezone.utc),
    )
    await record.insert()
    return record


@router.get("/{patient_id}/records/{record_id}", response_model=PatientRecordResponse)
async def get_record(
    patient_id: str,
    record_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a single medical record."""
    _require_patient_access(patient_id, current_user)
    try:
        oid = PydanticObjectId(record_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record ID")
    record = await PatientRecord.get(oid)
    if not record or record.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return record


@router.delete("/{patient_id}/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(
    patient_id: str,
    record_id: str,
    current_user: User = Depends(require_doctor),
):
    """Delete a medical record. Doctors only."""
    try:
        oid = PydanticObjectId(record_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record ID")
    record = await PatientRecord.get(oid)
    if not record or record.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    await record.delete()


@router.patch("/{patient_id}/records/{record_id}", response_model=PatientRecordResponse)
async def update_record(
    patient_id: str,
    record_id: str,
    payload: PatientRecordUpdate,
    current_user: User = Depends(require_medical_staff),
):
    """Update a medical record. Doctors can update any; nurses can update vitals/notes."""
    try:
        oid = PydanticObjectId(record_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record ID")
    record = await PatientRecord.get(oid)
    if not record or record.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    update_data = payload.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    await record.set(update_data)
    return record


# ─── Prescriptions ───────────────────────────────────────────────────────────

@router.get("/{patient_id}/prescriptions", response_model=List[PrescriptionResponse])
async def list_prescriptions(
    patient_id: str,
    current_user: User = Depends(get_current_user),
):
    """List prescriptions for a patient.
    - Patient: only their own
    - Doctor / Nurse / Admin: any patient
    """
    _require_patient_access(patient_id, current_user)
    await _get_patient_or_404(patient_id)
    prescriptions = await Prescription.find(Prescription.patient_id == patient_id).to_list()
    return prescriptions


@router.post(
    "/{patient_id}/prescriptions",
    response_model=PrescriptionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_prescription(
    patient_id: str,
    payload: PrescriptionCreate,
    current_user: User = Depends(require_doctor),
):
    """Create a prescription for a patient. Doctors only."""
    await _get_patient_or_404(patient_id)
    prescription = Prescription(
        **payload.model_dump(exclude={"patient_id", "prescribed_by", "prescribed_by_id"}),
        patient_id=patient_id,
        prescribed_by=current_user.full_name or current_user.email,
        prescribed_by_id=str(current_user.id),
        created_at=datetime.now(timezone.utc),
    )
    await prescription.insert()
    return prescription


@router.get("/{patient_id}/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(
    patient_id: str,
    prescription_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a single prescription."""
    _require_patient_access(patient_id, current_user)
    try:
        oid = PydanticObjectId(prescription_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid prescription ID")
    prescription = await Prescription.get(oid)
    if not prescription or prescription.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    return prescription


@router.patch("/{patient_id}/prescriptions/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription_status(
    patient_id: str,
    prescription_id: str,
    payload: PrescriptionCreate,
    current_user: User = Depends(require_doctor),
):
    """Update a prescription. Doctors only."""
    try:
        oid = PydanticObjectId(prescription_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid prescription ID")
    prescription = await Prescription.get(oid)
    if not prescription or prescription.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")

    update_data = payload.model_dump(exclude_unset=True, exclude={"patient_id", "prescribed_by_id"})
    update_data["updated_at"] = datetime.now(timezone.utc)
    await prescription.set(update_data)
    return prescription


# ─── Appointments ─────────────────────────────────────────────────────────────

@router.get("/{patient_id}/appointments", response_model=List[AppointmentResponse])
async def list_appointments(
    patient_id: str,
    current_user: User = Depends(get_current_user),
):
    """List appointments for a patient.
    - Patient: only their own
    - Doctor / Nurse / Admin: any patient
    """
    _require_patient_access(patient_id, current_user)
    await _get_patient_or_404(patient_id)
    appointments = await Appointment.find(Appointment.patient_id == patient_id).to_list()
    return appointments


@router.post(
    "/{patient_id}/appointments",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_appointment(
    patient_id: str,
    payload: AppointmentCreate,
    current_user: User = Depends(require_doctor),
):
    """Create an appointment for a patient. Doctors only."""
    await _get_patient_or_404(patient_id)
    appointment = Appointment(
        **payload.model_dump(exclude={"patient_id"}),
        patient_id=patient_id,
        doctor_id=str(current_user.id),
        doctor_name=current_user.full_name or current_user.email,
        created_at=datetime.now(timezone.utc),
    )
    await appointment.insert()
    return appointment


@router.get("/{patient_id}/appointments/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    patient_id: str,
    appointment_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a single appointment."""
    _require_patient_access(patient_id, current_user)
    try:
        oid = PydanticObjectId(appointment_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid appointment ID")
    appointment = await Appointment.get(oid)
    if not appointment or appointment.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appointment


@router.patch("/{patient_id}/appointments/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    patient_id: str,
    appointment_id: str,
    payload: AppointmentUpdate,
    current_user: User = Depends(require_medical_staff),
):
    """Update an appointment status/details. Doctors and nurses."""
    try:
        oid = PydanticObjectId(appointment_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid appointment ID")
    appointment = await Appointment.get(oid)
    if not appointment or appointment.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    update_data = payload.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    await appointment.set(update_data)
    return appointment


@router.delete("/{patient_id}/appointments/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appointment(
    patient_id: str,
    appointment_id: str,
    current_user: User = Depends(require_doctor),
):
    """Delete an appointment. Doctors only."""
    try:
        oid = PydanticObjectId(appointment_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid appointment ID")
    appointment = await Appointment.get(oid)
    if not appointment or appointment.patient_id != patient_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    await appointment.delete()


# ─── Profile update (self) ────────────────────────────────────────────────────

@router.patch("/me/profile", response_model=UserResponse)
async def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update own profile (full_name, date_of_birth). Any authenticated user."""
    update_data = payload.model_dump(exclude_unset=True)
    await current_user.set(update_data)
    return current_user
