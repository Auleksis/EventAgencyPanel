from typing import Optional

from pydantic import BaseModel
import datetime


class EventRequestsResponseModel(BaseModel):
    id: str
    event_name: str
    client_fullname: str
    client_email: str
    client_phone_number: str
    event_date: str
    showman_fullname: Optional[str] = None
    client_description: str


class EventScheduleResponseModel(BaseModel):
    id: str
    event_name: str
    address: str
    event_date: str
    event_manager_fullname: str
    showman_fullname: str
    client_fullname: str
    client_email: str
    client_phone_number: str


class EventEconomicsResponseModel(BaseModel):
    id: str
    event_name: str
    type: str
    description: str
    value: float
    expected: bool
