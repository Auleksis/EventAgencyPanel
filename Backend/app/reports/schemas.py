from pydantic import BaseModel


class EventReportAdd(BaseModel):
    event_id: str
    type: str
    value: float
    description: str


class EventReportRemove(BaseModel):
    event_id: str
    report_id: str


class ReportModel(BaseModel):
    id: str
    type: str
    value: float
    description: str
