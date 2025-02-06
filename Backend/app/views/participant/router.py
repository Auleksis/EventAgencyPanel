from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.views.participant.schemas import *

from app.database import *
from app.auth import create_access_token, get_current_user

import json

router = APIRouter(prefix='/participant', tags=['Calling participant views'])


@router.get("/event_info", summary="Get event info summary",
            response_model=List[EventInfoParticipantsResponseModel])
async def event_info(current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'participant':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventInfoParticipantView] = []
    with create_session() as session:
        result = session.query(EventInfoParticipantView).all()
        participant = session.query(Participant).filter_by(email=current_user.email).first()
        events = [e.event_id for e in session.query(InviteList).filter_by(participant_id=participant.id).all()]
        for row in result:
            if row.id in events:
                response += [row]

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "address": row.address, "event_date": str(row.event_date),
                      "event_manager_fullname": row.event_manager_fullname,
                      "event_manager_email": row.event_manager_email,
                      "event_manager_phone_number": row.event_manager_phone_number,
                      "description_for_participants": row.description_for_participants}
                     for row in response]
    return json_response


@router.get("/event_developers/{event_id}", summary="Get event developers descriptions",
            response_model=EventDevelopersInfoResponseModel)
async def event_developers(event_id: str, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'participant':
        raise HTTPException(status_code=401, detail="Forbidden")

    with create_session() as session:
        participant = session.query(Participant).filter_by(email=current_user.email).first()
        event_ids = [str(e.event_id) for e in session.query(InviteList).filter_by(participant_id=participant.id).all()]

        print(event_ids)

        if event_id not in event_ids:
            raise HTTPException(status_code=401, detail="Forbidden")

        response = session.query(EventDevelopersInfoView).filter_by(id=event_id).first()

    json_response = {"id": str(response.id), "event_name": response.event_name,
                     "showman_fullname": response.showman_fullname, "showman_description": response.showman_description,
                     "event_manager_fullname": response.event_manager_fullname,
                     "event_manager_description": response.event_manager_description}
    return json_response
