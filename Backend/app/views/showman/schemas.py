from pydantic import BaseModel


class EventInfoShowmanResponseModel(BaseModel):
    id: str
    event_name: str
    address: str
    event_date: str
    event_manager_fullname: str
    admin_fullname: str
    client_fullname: str
    client_email: str
    client_phone_number: str
    description_for_showman: str
    client_description: str


class EventParticipantsShowmanResponseModel(BaseModel):
    id: str
    event_name: str
    participant_fullname: str
    participant_email: str
    participant_phone_number: str
