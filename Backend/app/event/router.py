from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_

from app.event.schemas import *

from app.database import *
from app.auth import get_current_user

router = APIRouter(prefix='/event', tags=['Event management'])


@router.post("/add_event", summary="Add new event", response_model=str)
async def add_event(event: EventCreateRequestModel, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'client':
        raise HTTPException(status_code=410, detail="Forbidden")

    if event.event_date <= datetime.date.today():
        raise HTTPException(status_code=411, detail="Event must be in future")

    with create_session() as session:
        # if event.admin_id is not None:
        #     event_same_admin = session.query(Event).filter_by(event_date=event.event_date,
        #                                                       event_admin_id=event.admin_id).first()
        #     if event_same_admin is not None:
        #         raise HTTPException(status_code=450, detail="Impossible to create event. "
        #                                                     "Admin is busy this date")
        #
        # if event.event_manager_id is not None:
        #     event_same_manager = session.query(Event).filter_by(event_date=event.event_date,
        #                                                         event_manager_id=event.event_manager_id).first()
        #     if event_same_manager is not None:
        #         raise HTTPException(status_code=412, detail="Impossible to create event. "
        #                                                     "Event manager is busy this date")
        #
        # if event.showman_id is not None:
        #     event_same_showman = session.query(Event).filter_by(event_date=event.event_date,
        #                                                         showman_id=event.showman_id).first()
        #     if event_same_showman is not None:
        #         raise HTTPException(status_code=413, detail="Impossible to create event. "
        #                                                     "Showman is busy this date")

        if event.place_id is not None:
            event_same_place = session.query(Event).filter_by(event_date=event.event_date,
                                                              place_id=event.place_id).first()
            if event_same_place is not None:
                raise HTTPException(status_code=414, detail="Impossible to create event. "
                                                            "Place is busy this date")

        # admin = session.query(Admin).filter_by(email=current_user.email).first()

        client_id = session.query(Client).filter_by(email=current_user.email).first().id

        new_event = Event(event_name=event.event_name,
                          event_date=event.event_date,
                          client_description=event.client_description,
                          client_id=client_id,
                          place_id=event.place_id)

        session.add(new_event)

        session.commit()

    return "successfully created"


@router.put("/update_event_become_admin", summary="Update event info by admins", response_model=str)
async def update_event_become_admin(event: EventBecomeAdmin,
                                    current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        found_event = session.query(Event).filter_by(id=event.event_id).first()

        if found_event is None:
            raise HTTPException(status_code=418, detail="No event with such id")

        admin = session.query(Admin).filter_by(id=found_event.admin_id).first()
        if admin:
            raise HTTPException(status_code=419, detail="Admin is already defined")

        admin = session.query(Admin).filter_by(email=current_user.email).first()

        session.query(Event).filter_by(id=event.event_id).update({"admin_id": admin.id})
        session.commit()

    return "Successfully updated"


@router.put("/update_event_admin", summary="Update event info by admins", response_model=str)
async def update_event_admin(event: EventUpdateAdminRequestModel,
                             current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin':
        raise HTTPException(status_code=410, detail="Forbidden")

    if event.event_date is not None and event.event_date <= datetime.date.today():
        raise HTTPException(status_code=417, detail="Event must be in future")

    with create_session() as session:
        found_event = session.query(Event).filter_by(id=event.id).first()

        if found_event is None:
            raise HTTPException(status_code=418, detail="No event with such id")

        if current_user.role == 'admin':
            admin = session.query(Admin).filter_by(email=current_user.email).first()
            if found_event.admin_id != admin.id:
                raise HTTPException(status_code=419, detail="No access to modify this event")

        updated_data = event.dict(exclude_none=True)
        session.query(Event).filter_by(id=event.id).update(updated_data)
        session.commit()

    return "Successfully updated"


@router.put("/update_event_client", summary="Update event info by event manager",
            response_model=str)
async def update_event_info_for_participants(event: EventUpdateInfoRequestModel,
                                             current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'client':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        found_event = session.query(Event).filter_by(id=event.id).first()

        if found_event is None:
            raise HTTPException(status_code=421, detail="No event with such id")

        if current_user.role == 'client':
            client = session.query(Client).filter_by(email=current_user.email).first()
            if found_event.client_id != client.id:
                raise HTTPException(status_code=422, detail="No access to modify this event")

        updated_data = event.dict(exclude_none=True)
        session.query(Event).filter_by(id=event.id).update(updated_data)
        session.commit()

    return "Successfully updated"


@router.get("/get_events", summary="Get short info about all events", response_model=EventSearchResponse)
async def get_events(params: EventSearchParams = Depends(), current_user: Credentials = Depends(get_current_user)):
    if (
            current_user.role != 'db admin' and current_user.role != 'admin' and current_user.role != 'event manager'
            and current_user.role != 'showman' and current_user.role != 'client' and current_user.role != 'participant'
    ):
        raise HTTPException(status_code=410, detail="Forbidden")
    with create_session() as session:
        if current_user.role == 'admin' or current_user.role == 'db admin':
            events_query = session.query(Event, Place).outerjoin(Place, Place.id == Event.place_id)

            if params.showRequests:
                events_query = events_query.filter(Event.admin_id.is_(None))

            if params.showAttention:
                events_query = events_query.filter(or_(Event.showman_id.is_(None),
                                                       Event.event_manager_id.is_(None),
                                                       Event.place_id.is_(None),
                                                       Event.description_for_event_manager.is_(None),
                                                       Event.description_for_showman.is_(None),
                                                       Event.description_for_participants.is_(None)))

            if params.showOwn and current_user.role == 'admin':
                admin = session.query(Admin).filter_by(email=current_user.email).first()
                events_query = events_query.filter(Event.admin_id == admin.id)

            events = events_query.all()
            final_list = events[params.skip: params.skip + params.limit]

        elif current_user.role == 'event manager':
            events_query = session.query(
                Event, Place, EventManager
            ).outerjoin(
                Place, Place.id == Event.place_id
            ).outerjoin(
                EventManager, EventManager.id == Event.event_manager_id
            ).filter(EventManager.email == current_user.email)

            events = events_query.all()
            final_list = events[params.skip: params.skip + params.limit]
            final_list = [(e, p) for e, p, em in final_list]

        elif current_user.role == 'showman':
            events_query = session.query(
                Event, Place, Showman
            ).outerjoin(
                Place, Place.id == Event.place_id
            ).outerjoin(
                Showman, Showman.id == Event.showman_id
            ).filter(Showman.email == current_user.email)

            events = events_query.all()
            final_list = events[params.skip: params.skip + params.limit]
            final_list = [(e, p) for e, p, sm in final_list]

        elif current_user.role == 'client':
            events_query = session.query(
                Event, Place, Client
            ).outerjoin(
                Place, Place.id == Event.place_id
            ).outerjoin(
                Client, Client.id == Event.client_id
            ).filter(Client.email == current_user.email)

            events = events_query.all()
            final_list = events[params.skip: params.skip + params.limit]
            final_list = [(e, p) for e, p, client in final_list]

        elif current_user.role == 'participant':
            events_query = session.query(
                InviteList, Participant, Event, Place
            ).outerjoin(
                Participant, Participant.id == InviteList.participant_id
            ).filter(
                Participant.email == current_user.email
            ).outerjoin(
                Event, InviteList.event_id == Event.id
            ).outerjoin(
                Place, Place.id == Event.place_id
            )

            events = events_query.all()
            final_list = events[params.skip: params.skip + params.limit]
            final_list = [(e, p) for il, pt, e, p in final_list]

    return {"count": len(events), "events": [{"id": str(e.id), "event_name": e.event_name, "event_date": e.event_date,
                                              "place_name": p.name if p else None,
                                              "place_address": p.address if p else None} for e, p in final_list]}


@router.get("/get_event", summary="Get specified event info", response_model=EventExpandedResponseModel)
async def get_event(event_id: str, current_user: Credentials = Depends(get_current_user)):
    if (
            current_user.role != 'db admin' and current_user.role != 'admin' and current_user.role != 'event manager'
            and current_user.role != 'showman' and current_user.role != 'client' and current_user.role != 'participant'
    ):
        raise HTTPException(status_code=410, detail="Forbidden")
    with create_session() as session:
        found_event = session.query(Event).filter_by(id=event_id).first()
        if found_event is None:
            raise HTTPException(status_code=425, detail="No event with such id")

        if current_user.role == 'db admin' or current_user.role == 'admin':
            event_query = session.query(
                Event, Admin, Place, Showman, EventManager, Client
            ).filter(
                Event.id == event_id
            ).outerjoin(
                Admin, Admin.id == Event.admin_id
            ).outerjoin(
                Place, Place.id == Event.place_id
            ).outerjoin(
                Showman, Showman.id == Event.showman_id
            ).outerjoin(
                EventManager, EventManager.id == Event.event_manager_id
            ).outerjoin(
                Client, Client.id == Event.client_id
            )

        elif current_user.role == 'event manager':
            event_query = session.query(
                Event, Admin, Place, Showman, EventManager, Client
            ).filter(
                Event.id == event_id
            ).outerjoin(
                Admin, Admin.id == Event.admin_id
            ).outerjoin(
                Place, Place.id == Event.place_id
            ).outerjoin(
                Showman, Showman.id == Event.showman_id
            ).outerjoin(
                EventManager, EventManager.id == Event.event_manager_id
            ).filter(
                EventManager.email == current_user.email
            ).outerjoin(
                Client, Client.id == Event.client_id
            )

        elif current_user.role == 'showman':
            event_query = session.query(
                Event, Admin, Place, Showman, EventManager, Client
            ).filter(
                Event.id == event_id
            ).outerjoin(
                Admin, Admin.id == Event.admin_id
            ).outerjoin(
                Place, Place.id == Event.place_id
            ).outerjoin(
                Showman, Showman.id == Event.showman_id
            ).filter(
                Showman.email == current_user.email
            ).outerjoin(
                EventManager, EventManager.id == Event.event_manager_id
            ).outerjoin(
                Client, Client.id == Event.client_id
            )

        elif current_user.role == 'client':
            event_query = session.query(
                Event, Admin, Place, Showman, EventManager, Client
            ).filter(
                Event.id == event_id
            ).outerjoin(
                Admin, Admin.id == Event.admin_id
            ).outerjoin(
                Place, Place.id == Event.place_id
            ).outerjoin(
                Showman, Showman.id == Event.showman_id
            ).outerjoin(
                EventManager, EventManager.id == Event.event_manager_id
            ).outerjoin(
                Client, Client.id == Event.client_id
            ).filter(
                Client.email == current_user.email
            )

        elif current_user.role == 'participant':
            found_participant = session.query(InviteList, Participant).filter(
                InviteList.event_id == event_id
            ).outerjoin(
                Participant, Participant.id == InviteList.participant_id
            ).first()

            if found_participant is None:
                raise HTTPException(status_code=460, detail="Forbidden")

            event_query = session.query(
                Event, Admin, Place, Showman, EventManager, Client
            ).filter(
                Event.id == event_id
            ).outerjoin(
                Admin, Admin.id == Event.admin_id
            ).outerjoin(
                Place, Place.id == Event.place_id
            ).outerjoin(
                Showman, Showman.id == Event.showman_id
            ).outerjoin(
                EventManager, EventManager.id == Event.event_manager_id
            ).outerjoin(
                Client, Client.id == Event.client_id
            )

        # result = session.query(
        #     Event, Place, Showman, EventManager, Client
        # ).filter(Event.id == event_id).outerjoin(
        #     Place, Event.place_id == Place.id
        # ).outerjoin(
        #     Showman, Event.showman_id == Showman.id
        # ).outerjoin(
        #     EventManager, Event.event_manager_id == EventManager.id
        # ).outerjoin(
        #     Client, Event.client_id == Client.id
        # ).first()

    result = event_query.first()

    if result is None:
        raise HTTPException(status_code=460, detail="Forbidden")

    event, admin, place, showman, em, client = result

    if event:
        print('event', event.id)
    if admin:
        print('admin', admin.id, admin.full_name)
    if place:
        print('place', place.id, place.name)
    if showman:
        print('showman', showman.id, showman.full_name)
    if em:
        print('event manager', em.id, em.full_name)
    if client:
        print('client', client.id, client.full_name)

    # invites_ids = [i.participant_id for i in session.query(InviteList).filter_by(event_id=event_id).all()] if (
    #         current_user.role == 'db admin' or current_user.role == 'admin'
    #         or current_user.role == 'event manager' or current_user.role == 'showman'
    # ) else None
    #
    # invites = None
    #
    # if invites_ids is not None:
    #     invites = []
    #     for found_id in invites_ids:
    #         participant = session.query(Participant).filter_by(id=found_id).first()
    #         invites.append({"fullname": participant.full_name, "email": participant.email,
    #                         "phone_number": participant.phone_number})
    #
    # reports = None
    #
    # if current_user.role == 'db admin' or current_user.role == 'admin':
    #     reports = []
    #     for r in session.query(EventEconomics).filter_by(event_id=event_id).all():
    #         reports.append({"id": r.id, "type": r.type, "value": r.value, "description": r.description})

    return {"id": str(event.id),
            "event_name": event.event_name,
            "event_date": event.event_date,
            "client_description": event.client_description,
            "client_fullname": client.full_name,
            "client_email": client.email,
            "client_phone_number": client.phone_number,
            "place_name": place.name if place is not None else None,

            "description_for_participants": event.description_for_participants,
            "description_for_event_manager": event.description_for_event_manager if current_user.role == 'event manager' or current_user.role == 'admin' or current_user.role == 'db admin' else None,
            "description_for_showman": event.description_for_showman if current_user.role == 'showman' or current_user.role == 'admin' or current_user.role == 'db admin' else None,

            "admin_fullname": admin.full_name if admin is not None and (
                    current_user.role == 'participant' or current_user.role == 'client' or current_user.role == 'event manager' or current_user.role == 'showman' or current_user.role == 'admin' or current_user.role == 'db admin') else None,
            "admin_email": admin.email if admin is not None and (
                    current_user.role == 'participant' or current_user.role == 'client' or current_user.role == 'event manager' or current_user.role == 'showman' or current_user.role == 'admin' or current_user.role == 'db admin') else None,
            "admin_number": admin.phone_number if admin is not None and (
                    current_user.role == 'participant' or current_user.role == 'client' or current_user.role == 'event manager' or current_user.role == 'showman' or current_user.role == 'admin' or current_user.role == 'db admin') else None,

            "showman_fullname": showman.full_name if showman is not None and (
                    current_user.role == 'event manager' or current_user.role == 'admin' or current_user.role == 'db admin') else None,
            "showman_email": showman.email if showman is not None and (
                    current_user.role == 'event manager' or current_user.role == 'admin' or current_user.role == 'db admin') else None,
            "showman_number": showman.phone_number if showman is not None and (
                    current_user.role == 'event manager' or current_user.role == 'admin' or current_user.role == 'db admin') else None,

            "event_manager_fullname": em.full_name if em is not None and (
                    current_user.role == 'client' or current_user.role == 'showman' or current_user.role == 'participant' or current_user.role == 'admin' or current_user.role == 'db admin') else None,
            "event_manager_email": em.email if em is not None and (
                    current_user.role == 'client' or current_user.role == 'showman' or current_user.role == 'participant' or current_user.role == 'admin' or current_user.role == 'db admin') else None,
            "event_manager_number": em.phone_number if em is not None and (
                    current_user.role == 'client' or current_user.role == 'showman' or current_user.role == 'participant' or current_user.role == 'admin' or current_user.role == 'db admin') else None,
            }


@router.delete("/remove_event", summary="Remove specified event", response_model=str)
async def remove_event(place_id: str, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        found_event = session.query(Event).filter_by(id=place_id).first()
        if found_event is None:
            raise HTTPException(status_code=427, detail="No event with such id")

        admin = session.query(Admin).filter_by(email=current_user.email).first()
        if current_user.role == 'admin':
            if found_event.admin_id != admin.id:
                raise HTTPException(status_code=428, detail="No access to remove this event")

        session.delete(found_event)
        session.commit()

    return "Event was successfully removed"
