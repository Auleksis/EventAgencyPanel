from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.views.client.schemas import *

from app.database import *
from app.auth import create_access_token, get_current_user

import json

router = APIRouter(prefix='/client', tags=['Calling client views'])


@router.get("/event_info", summary="Get event info summary",
            response_model=List[EventInfoClientResponseModel])
async def event_info(current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'client':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventInfoClientView] = []
    with create_session() as session:
        result = session.query(EventInfoClientView).all()
        client = session.query(Client).filter_by(email=current_user.email).first()
        events = [e.id for e in session.query(Event).filter_by(client_id=client.id).all()]
        for row in result:
            if row.id in events:
                response += [row]

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "address": row.address, "event_date": str(row.event_date),
                      "event_manager_fullname": row.event_manager_fullname,
                      "event_manager_email": row.event_manager_email,
                      "event_manager_phone_number": row.event_manager_phone_number,
                      "admin_fullname": row.admin_fullname, "admin_email": row.admin_email,
                      "admin_phone_number": row.admin_phone_number,
                      "showman_fullname": row.showman_fullname, "showman_email": row.showman_email,
                      "showman_phone_number": row.showman_phone_number,
                      "client_description": row.client_description}
                     for row in response]
    return json_response


@router.get("/event_participants/{event_id}", summary="Get participants of special event managed by client",
            response_model=List[EventParticipantsClientResponseModel])
async def event_participants(event_id: str, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'client':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventParticipantsClientView] = []
    with create_session() as session:
        client = session.query(Client).filter_by(email=current_user.email).first()
        event = session.query(Event).filter_by(id=event_id, client_id=client.id).first()

        if event is None:
            raise HTTPException(status_code=401, detail="Forbidden")

        response = session.query(EventParticipantsClientView).filter_by(id=event_id).all()

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "participant_fullname": row.participant_fullname, "participant_email": row.participant_email,
                      "participant_phone_number": row.participant_phone_number}
                     for row in response]
    return json_response
