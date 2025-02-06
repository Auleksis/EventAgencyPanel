from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.views.admin.schemas import *

from app.database import *
from app.auth import create_access_token, get_current_user

import json

router = APIRouter(prefix='/admin', tags=['Calling admin views'])


@router.get("/event_requests", summary="Get event requests summary",
            response_model=List[EventRequestsResponseModel])
async def event_requests(current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=401, detail="Forbidden")

    # Admins can see every event:

    response: [EventRequestsView] = []
    with create_session() as session:
        result = session.query(EventRequestsView).all()
        # admin = session.query(Admin).filter_by(email=current_user.email).first()
        # events = [e.id for e in session.query(Event).filter_by(admin_id=admin.id).all()]
        response = result
        # for row in result:
        #     if row.id in events:
        #         response += [row]

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "client_fullname": row.client_fullname, "client_email": row.client_email,
                      "client_phone_number": row.client_phone_number, "event_date": str(row.event_date),
                      "showman_fullname": row.showman_fullname, "client_description": row.client_description}
                     for row in response]
    return json_response


@router.get("/events_by_admin", summary="Get all events which rely on admin",
            response_model=List[EventRequestsResponseModel])
async def events_by_admin(current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventRequestsView] = []
    with create_session() as session:
        result = session.query(EventRequestsView).all()
        admin = session.query(Admin).filter_by(email=current_user.email).first()
        events = [e.id for e in session.query(Event).filter_by(admin_id=admin.id).all()]
        for row in result:
            if row.id in events:
                response += [row]

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "client_fullname": row.client_fullname, "client_email": row.client_email,
                      "client_phone_number": row.client_phone_number, "event_date": str(row.event_date),
                      "showman_fullname": row.showman_fullname, "client_description": row.client_description}
                     for row in response]
    return json_response


@router.get("/event_schedule", summary="Get events schedule",
            response_model=List[EventScheduleResponseModel])
async def event_schedule(current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventScheduleView] = []
    with create_session() as session:
        response = session.query(EventScheduleView).all()

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "address": row.address, "event_date": str(row.event_date),
                      "event_manager_fullname": row.event_manager_fullname, "showman_fullname": row.showman_fullname,
                      "client_fullname": row.client_fullname, "client_email": row.client_email,
                      "client_phone_number": row.client_phone_number}
                     for row in response]
    return json_response


@router.get("/event_schedule_by_admin", summary="Get events schedule for specific admin",
            response_model=List[EventScheduleResponseModel])
async def event_schedule_by_admin(current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventScheduleView] = []
    with create_session() as session:
        result = session.query(EventScheduleView).all()
        admin = session.query(Admin).filter_by(email=current_user.email).first()
        events = [e.id for e in session.query(Event).filter_by(admin_id=admin.id).all()]
        for row in result:
            if row.id in events:
                response += [row]

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "address": row.address, "event_date": str(row.event_date),
                      "event_manager_fullname": row.event_manager_fullname, "showman_fullname": row.showman_fullname,
                      "client_fullname": row.client_fullname, "client_email": row.client_email,
                      "client_phone_number": row.client_phone_number}
                     for row in response]
    return json_response


@router.get("/event_economics", summary="Get event economics summary",
            response_model=List[EventEconomicsResponseModel])
async def event_economics(current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventEconomicsView] = []
    with create_session() as session:
        response = session.query(EventEconomicsView).all()

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "type": row.type, "description": row.description,
                      "value": row.value, "expected": row.expected}
                     for row in response]
    return json_response


@router.get("/event_economics_by_admin", summary="Get event economics by admin",
            response_model=List[EventEconomicsResponseModel])
async def event_economics_by_admin(current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=401, detail="Forbidden")

    response: [EventEconomicsView] = []
    with create_session() as session:
        result = session.query(EventEconomicsView).all()
        admin = session.query(Admin).filter_by(email=current_user.email).first()
        events = [e.id for e in session.query(Event).filter_by(admin_id=admin.id).all()]
        for row in result:
            if row.id in events:
                response += [row]

    json_response = [{"id": str(row.id), "event_name": row.event_name,
                      "type": row.type, "description": row.description,
                      "value": row.value, "expected": row.expected}
                     for row in response]
    return json_response
