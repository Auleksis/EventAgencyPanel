from pydantic import BaseModel


class AddInvite(BaseModel):
    event_id: str
    participant_email: str


class RemoveInvite(BaseModel):
    event_id: str
    participant_id: str
