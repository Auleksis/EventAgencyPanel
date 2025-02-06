from pydantic import BaseModel


class EventInfoClientResponseModel(BaseModel):
    id: str
    event_name: str
    address: str
    event_date: str
    event_manager_fullname: str
    event_manager_email: str
    event_manager_phone_number: str
    admin_fullname: str
    admin_email: str
    admin_phone_number: str
    showman_fullname: str
    showman_email: str
    showman_phone_number: str
    client_description: str


class EventParticipantsClientResponseModel(BaseModel):
    id: str
    event_name: str
    participant_fullname: str
    participant_email: str
    participant_phone_number: str
