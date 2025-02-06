from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.views.showman.schemas import *

from app.database import *
from app.auth import create_access_token, get_current_user

import json

router = APIRouter(prefix='/showman', tags=['Calling showman views'])


@router.get("/event_info", summary="Get event info summary",
            response_model=List[EventInfoShowmanResponseModel])
async def event_info(current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'showman':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventInfoShowmanView] = []
    with create_session() as session:
        result = session.query(EventInfoShowmanView).all()
        showman = session.query(Showman).filter_by(email=current_user.email).first()
        events = [e.id for e in session.query(Event).filter_by(showman_id=showman.id).all()]
        for row in result:
            if row.id in events:
                response += [row]

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "address": row.address, "event_date": str(row.event_date),
                      "event_manager_fullname": row.event_manager_fullname, "admin_fullname": row.admin_fullname,
                      "client_fullname": row.client_fullname, "client_email": row.client_email,
                      "client_phone_number": row.client_phone_number,
                      "description_for_showman": row.description_for_showman,
                      "client_description": row.client_description}
                     for row in response]
    return json_response


@router.get("/event_participants/{event_id}", summary="Get participants of special event managed by showman",
            response_model=List[EventParticipantsShowmanResponseModel])
async def event_participants(event_id: str, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'showman':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventParticipantsShowmanView] = []
    with create_session() as session:
        showman = session.query(Showman).filter_by(email=current_user.email).first()
        event = session.query(Event).filter_by(id=event_id, showman_id=showman.id).first()

        if event is None:
            raise HTTPException(status_code=401, detail="Forbidden")

        response = session.query(EventParticipantsShowmanView).filter_by(id=event_id).all()

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "participant_fullname": row.participant_fullname, "participant_email": row.participant_email,
                      "participant_phone_number": row.participant_phone_number}
                     for row in response]
    return json_response
