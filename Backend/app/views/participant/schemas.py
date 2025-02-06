from pydantic import BaseModel


class EventInfoParticipantsResponseModel(BaseModel):
    id: str
    event_name: str
    address: str
    event_date: str
    event_manager_fullname: str
    event_manager_email: str
    event_manager_phone_number: str
    description_for_participants: str


class EventDevelopersInfoResponseModel(BaseModel):
    id: str
    event_name: str
    showman_fullname: str
    showman_description: str
    event_manager_fullname: str
    event_manager_description: str
