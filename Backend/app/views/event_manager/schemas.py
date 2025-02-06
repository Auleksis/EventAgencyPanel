from pydantic import BaseModel
import datetime


class EventInfoEMResponseModel(BaseModel):
    id: str
    event_name: str
    address: str
    event_date: str
    showman_fullname: str
    admin_fullname: str
    client_fullname: str
    client_email: str
    client_phone_number: str
    description_for_event_manager: str
    client_description: str


class EventParticipantsEMResponseModel(BaseModel):
    id: str
    event_name: str
    participant_fullname: str
    participant_email: str
    participant_phone_number: str
