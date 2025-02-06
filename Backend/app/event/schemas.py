from typing import Optional, List

from pydantic import BaseModel
import datetime
from uuid import UUID


class EventCreateRequestModel(BaseModel):
    event_name: str
    event_date: datetime.date
    client_description: str
    place_id: Optional[UUID] = None
    event_manager_id: Optional[UUID] = None


class EventUpdateAdminRequestModel(BaseModel):
    id: str
    event_name: Optional[str] = None
    event_date: Optional[datetime.date] = None
    client_description: Optional[str] = None
    description_for_event_manager: Optional[str] = None
    description_for_showman: Optional[str] = None
    description_for_participants: Optional[str] = None
    admin_id: Optional[UUID] = None
    place_id: Optional[UUID] = None
    showman_id: Optional[UUID] = None
    event_manager_id: Optional[UUID] = None


class EventUpdateInfoRequestModel(BaseModel):
    id: str
    client_description: Optional[str] = None


class EventResponseModel(BaseModel):
    id: str
    event_name: str
    event_date: datetime.date
    client_description: str
    client_id: str
    place_id: Optional[str] = None


class EventShortResponseModel(BaseModel):
    id: str
    event_name: str
    event_date: datetime.date
    place_name: Optional[str] = None
    place_address: Optional[str] = None
    mode: Optional[int] = None # Чтобы выделить событие


class EventExpandedResponseModel(BaseModel):
    id: str

    event_name: str
    event_date: datetime.date

    client_description: str
    description_for_event_manager: Optional[str] = None
    description_for_showman: Optional[str] = None
    description_for_participants: Optional[str] = None

    place_name: Optional[str] = None

    admin_fullname: Optional[str] = None
    admin_email: Optional[str] = None
    admin_number: Optional[str] = None

    showman_fullname: Optional[str] = None
    showman_email: Optional[str] = None
    showman_number: Optional[str] = None

    event_manager_fullname: Optional[str] = None
    event_manager_email: Optional[str] = None
    event_manager_number: Optional[str] = None

    client_fullname: str
    client_email: str
    client_phone_number: str


class EventSearchParams(BaseModel):
    skip: int = 0
    limit: int = 10

    # The following params are useful only for admins
    showRequests: Optional[bool] = None
    showAttention: Optional[bool] = None
    showOwn: Optional[bool] = None


class EventSearchResponse(BaseModel):
    count: int
    events: List[EventShortResponseModel]


class EventBecomeAdmin(BaseModel):
    event_id: str

