from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.invitelist.schemas import *

from app.database import *
from app.auth import get_current_user

router = APIRouter(prefix='/invite_list', tags=['Invite list management'])


@router.post("/invite", summary="Invite participant to event", response_model=str)
async def invite(add_invite: AddInvite, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin' and current_user.role != 'client':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        found_event = session.query(Event).filter_by(id=add_invite.event_id).first()
        if found_event is None:
            raise HTTPException(status_code=410, detail="No such event")

        if current_user.role == 'admin':
            admin_id = session.query(Admin).filter_by(email=current_user.email).first().id
            if admin_id != found_event.admin_id:
                raise HTTPException(status_code=411, detail="Forbidden")
        elif current_user.role == 'client':
            client_id = session.query(Client).filter_by(email=current_user.email).first().id
            if client_id != found_event.client_id:
                raise HTTPException(status_code=411, detail="Forbidden")

        found_participant = session.query(Participant).filter_by(email=add_invite.participant_email).first()
        if found_participant is None:
            raise HTTPException(status_code=412, detail="No such participant")

        if session.query(InviteList).filter_by(event_id=add_invite.event_id,
                                               participant_id=found_participant.id).first() is not None:
            raise HTTPException(status_code=413, detail="Participant is already invited")

        invite_note = InviteList(event_id=add_invite.event_id, participant_id=found_participant.id)

        session.add(invite_note)
        session.commit()

    return "Participant was successfully invited"


@router.post("/remove_note", summary="Remove invite", response_model=str)
async def remove_note(remove_invite: RemoveInvite, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin' and current_user.role != 'client':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        found_event = session.query(Event).filter_by(id=remove_invite.event_id).first()
        if found_event is None:
            raise HTTPException(status_code=410, detail="No such event")

        if current_user.role == 'admin':
            admin_id = session.query(Admin).filter_by(email=current_user.email).first().id
            if admin_id != found_event.admin_id:
                raise HTTPException(status_code=411, detail="Forbidden")
        elif current_user.role == 'client':
            client_id = session.query(Client).filter_by(email=current_user.email).first().id
            if client_id != found_event.client_id:
                raise HTTPException(status_code=411, detail="Forbidden")

        found_participant = session.query(Participant).filter_by(id=remove_invite.participant_id).first()
        if found_participant is None:
            raise HTTPException(status_code=412, detail="No such participant")

        invite_note = session.query(InviteList).filter_by(event_id=remove_invite.event_id,
                                                          participant_id=remove_invite.participant_id).first()

        if invite_note is None:
            raise HTTPException(status_code=413, detail="No such invite")

        session.delete(invite_note)
        session.commit()

    return "Participant was successfully deleted from event"
