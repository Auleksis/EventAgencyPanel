from typing import Optional, List

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class UserRegistrationModel(BaseModel):
    email: str
    password: str
    phone_number: str
    full_name: str


class AdminRegistrationModel(UserRegistrationModel):
    pass


class EmployeeRegistrationModel(UserRegistrationModel):
    description: str


class EventManagerRegistrationModel(EmployeeRegistrationModel):
    pass


class ShowmanRegistrationModel(EmployeeRegistrationModel):
    pass


class GuestRegistrationModel(UserRegistrationModel):
    age: int


class ClientRegistrationModel(GuestRegistrationModel):
    pass


class ParticipantRegistrationModel(GuestRegistrationModel):
    pass


###########################################
###########################################
###########################################

class UserUpdateModel(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


class EmployeeUpdateModel(UserUpdateModel):
    summary: Optional[str] = None


class GuestUpdateModel(UserUpdateModel):
    age: Optional[int] = None


###########################################
###########################################
###########################################

class UserResponseModel(BaseModel):
    id: Optional[str] = None
    full_name: str
    email: str
    phone_number: str
    role: str
    age: Optional[int] = None
    summary: Optional[str] = None


class UsersListResponseModel(BaseModel):
    count: int
    users: List[UserResponseModel]


class UserSearchParamsModel(BaseModel):
    skip: int = 0
    limit: int = 10
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = None
    event_id: Optional[str] = None
