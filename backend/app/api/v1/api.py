from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, patients, audit_logs, admin, invites

api_router = APIRouter()

api_router.include_router(
    health.router,
    tags=["health"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    patients.router,
    prefix="/patients",
    tags=["patients"],
)

api_router.include_router(
    audit_logs.router,
    prefix="/audit-logs",
    tags=["audit-logs"],
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"],
)

api_router.include_router(
    invites.router,
    prefix="/invites",
    tags=["invites"],
)
