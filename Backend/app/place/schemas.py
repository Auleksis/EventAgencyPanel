from typing import Optional, List

from pydantic import BaseModel


class PlaceCreateRequestModel(BaseModel):
    name: str
    description: str
    capacity: int
    address: str


class PlaceUpdateRequestModel(BaseModel):
    id: str
    name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    address: Optional[str] = None


class PlaceResponseModel(BaseModel):
    id: str
    name: str
    description: str
    capacity: int
    address: str


class PlaceShortResponseModel(BaseModel):
    id: str
    name: str
    address: str
    capacity: int


class PlaceListModel(BaseModel):
    count: int
    places: List[PlaceShortResponseModel]


class PlaceSearchModel(BaseModel):
    skip: int = 0
    limit: int = 10
    name: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None
