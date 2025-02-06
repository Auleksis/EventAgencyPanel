from fastapi import APIRouter, Depends, HTTPException

from app.database import create_session, Credentials, Admin, EventManager, Showman, Client, Participant
from app.auth import create_access_token, get_current_user

from app.views.admin.router import router as admin_router
from app.views.event_manager.router import router as event_manager_router
from app.views.showman.router import router as showman_router
from app.views.client.router import router as client_router
from app.views.participant.router import router as participant_router


router = APIRouter(prefix='/views', tags=['Calling views'])

router.include_router(admin_router)
router.include_router(event_manager_router)
router.include_router(showman_router)
router.include_router(client_router)
router.include_router(participant_router)
