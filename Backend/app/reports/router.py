from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.reports.schemas import *

from app.database import *
from app.auth import get_current_user

router = APIRouter(prefix='/reports', tags=['Reports management'])


@router.post("/add_report", summary="Invite participant to event", response_model=str)
async def invite(report: EventReportAdd, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin' and current_user.role != 'event manager':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        found_event = session.query(Event).filter_by(id=report.event_id).first()
        if found_event is None:
            raise HTTPException(status_code=411, detail="No such event")

        if current_user.role == 'admin':
            admin_id = session.query(Admin).filter_by(email=current_user.email).first().id
            if admin_id != found_event.admin_id:
                raise HTTPException(status_code=412, detail="Forbidden")
        elif current_user.role == 'event manager':
            em_id = session.query(EventManager).filter_by(email=current_user.email).first().id
            if em_id != found_event.event_manager_id:
                raise HTTPException(status_code=412, detail="Forbidden")

        if report.value < 0:
            raise HTTPException(status_code=413, detail="Value has to be greater than 0")

        new_report = Report(event_id=report.event_id,
                            type=report.type,
                            value=report.value,
                            description=report.description)

        session.add(new_report)
        session.commit()

    return "Report was successfully added"


@router.get("/get_reports", summary="Get all reports of event", response_model=List[ReportModel])
async def get_reports(event_id: str, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin' and current_user.role != 'event manager':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        found_event = session.query(Event).filter_by(id=event_id).first()
        if found_event is None:
            raise HTTPException(status_code=411, detail="No such event")

        if current_user.role == 'admin':
            admin_id = session.query(Admin).filter_by(email=current_user.email).first().id
            if admin_id != found_event.admin_id:
                raise HTTPException(status_code=412, detail="Forbidden")
        elif current_user.role == 'event manager':
            em_id = session.query(EventManager).filter_by(email=current_user.email).first().id
            if em_id != found_event.event_manager_id:
                raise HTTPException(status_code=412, detail="Forbidden")

        reports = session.query(Report).filter_by(event_id=event_id).all()

    return [{"id": str(r.id), "type": r.type, "value": r.value, "description": r.description} for r in reports]


@router.delete("/remove_report", summary="Remove invite", response_model=str)
async def remove_note(report: EventReportRemove = Depends(), current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin' and current_user.role != 'event manager':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        found_event = session.query(Event).filter_by(id=report.event_id).first()
        if found_event is None:
            raise HTTPException(status_code=411, detail="No such event")

        if current_user.role == 'admin':
            admin_id = session.query(Admin).filter_by(email=current_user.email).first().id
            if admin_id != found_event.admin_id:
                raise HTTPException(status_code=412, detail="Forbidden")
        elif current_user.role == 'event manager':
            em_id = session.query(EventManager).filter_by(email=current_user.email).first().id
            if em_id != found_event.event_manager_id:
                raise HTTPException(status_code=412, detail="Forbidden")

        report_note = session.query(Report).filter_by(id=report.report_id).first()

        if report_note is None:
            raise HTTPException(status_code=413, detail="No such report")

        session.delete(report_note)
        session.commit()

    return "Report was successfully deleted"
