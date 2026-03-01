from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models import User, PatientRecord, Prescription, AuditLog, Invite, Appointment


async def _drop_stale_indexes(db) -> None:
    """Drop legacy indexes that no longer match the current schema."""
    stale = {
        "invites": ["token_1"],
    }
    for collection_name, index_names in stale.items():
        collection = db[collection_name]
        existing_names = set((await collection.index_information()).keys())
        for name in index_names:
            if name in existing_names:
                try:
                    await collection.drop_index(name)
                except Exception:
                    pass  # already gone or insufficient permissions


async def init_db():
    client = AsyncIOMotorClient(settings.DATABASE_URI)
    db = client.db_name
    await _drop_stale_indexes(db)
    await init_beanie(
        database=db,
        document_models=[User, PatientRecord, Prescription, AuditLog, Invite, Appointment],
    )
