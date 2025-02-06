import re
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.users.schemas import *

from app.database import create_session, Credentials, Admin, EventManager, Showman, Client, Participant, InviteList
from app.utils import check_password, hash_password, validate_phone_number
from app.auth import create_access_token, get_current_user

# SOME IMPORTANT RULES
# 1) Agency employees registration is available only for information system (or database) admin
# 2) Agency employees registration doesn't redirect to employees' page. It just returns a message
# 3) Clients and participants are redirected to their pages after registration


router = APIRouter(prefix='/users', tags=['Users management'])


@router.get("/me", summary="Get user info", response_model=UserResponseModel)
async def me(current_user: Credentials = Depends(get_current_user)):
    # Предполагается, что админы БД могут управлять БД только из офиса, они не могут никак зарегистрироваться,
    # поэтому таблицы для них отдельной нет
    if current_user.role == 'db admin':
        return {"full_name": "Администратор БД", "email": current_user.email, "phone_number": "+79098087071",
                "role": current_user.role}

    with create_session() as session:
        found = None
        if current_user.role == 'admin':
            found = session.query(Admin).filter_by(email=current_user.email).first()
        elif current_user.role == 'event manager':
            found = session.query(EventManager).filter_by(email=current_user.email).first()
        elif current_user.role == 'showman':
            found = session.query(Showman).filter_by(email=current_user.email).first()
        elif current_user.role == 'client':
            found = session.query(Client).filter_by(email=current_user.email).first()
        elif current_user.role == 'participant':
            found = session.query(Participant).filter_by(email=current_user.email).first()
        else:
            raise HTTPException(status_code=410, detail=f"Unknown role {current_user.role}")

    return {"full_name": found.full_name, "email": found.email, "phone_number": found.phone_number,
            "role": current_user.role, "id": str(found.id) if current_user.role != 'db admin' else None}


@router.post("/login", summary="Login into account", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with create_session() as session:
        credentials = session.query(Credentials).filter_by(email=form_data.username).first()
        if not credentials or not check_password(credentials.passwd, form_data.password):
            raise HTTPException(status_code=410, detail="Wrong email or password")

        access_token = create_access_token(data={"sub": form_data.username})
        return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register_admin", summary="Register an agency admin", response_model=str)
async def admin_register(admin: AdminRegistrationModel, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'db admin':
        raise HTTPException(status_code=410, detail="Forbidden")
    with create_session() as session:
        found_employee = session.query(Credentials).filter_by(email=admin.email).first()
        if found_employee:
            raise HTTPException(status_code=400, detail="Email already exists")

        found_admin = session.query(Admin).filter_by(phone_number=admin.phone_number).first()
        if found_admin:
            raise HTTPException(status_code=400, detail="Phone number already exists")

        new_credentials = Credentials(email=admin.email, passwd=hash_password(admin.password), role='admin')
        session.add(new_credentials)

        new_admin = Admin(email=admin.email, full_name=admin.full_name, phone_number=admin.phone_number)

        session.add(new_admin)

        session.commit()

    return "New agency admin was successfully registered"


@router.post("/register_event_manager", summary="Register an event manager", response_model=str)
async def event_manager_register(event_manager: EventManagerRegistrationModel,
                                 current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'db admin':
        raise HTTPException(status_code=410, detail="Forbidden")
    with create_session() as session:
        found_employee = session.query(Credentials).filter_by(email=event_manager.email).first()
        if found_employee:
            raise HTTPException(status_code=400, detail="Email already exists")

        found_event_manager = session.query(EventManager).filter_by(phone_number=event_manager.phone_number).first()
        if found_event_manager:
            raise HTTPException(status_code=400, detail="Phone number already exists")

        new_credentials = Credentials(email=event_manager.email, passwd=hash_password(event_manager.password),
                                      role='event manager')
        session.add(new_credentials)

        new_event_manager = EventManager(email=event_manager.email, full_name=event_manager.full_name,
                                         phone_number=event_manager.phone_number,
                                         description=event_manager.description)

        session.add(new_event_manager)

        session.commit()

    return "New event manager was successfully registered"


@router.post("/register_showman", summary="Register a showman", response_model=str)
async def showman_register(showman: ShowmanRegistrationModel, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'db admin':
        raise HTTPException(status_code=410, detail="Forbidden")
    with create_session() as session:

        found_employee = session.query(Credentials).filter_by(email=showman.email).first()
        if found_employee:
            raise HTTPException(status_code=400, detail="Email already exists")

        found_showman = session.query(Showman).filter_by(phone_number=showman.phone_number).first()
        if found_showman:
            raise HTTPException(status_code=400, detail="Phone number already exists")

        new_credentials = Credentials(email=showman.email, passwd=hash_password(showman.password),
                                      role='showman')

        session.add(new_credentials)

        new_showman = Showman(email=showman.email, full_name=showman.full_name,
                              phone_number=showman.phone_number,
                              description=showman.description)

        session.add(new_showman)

        session.commit()

    return "New showman was successfully registered"


@router.post("/register_client", summary="Register a client", response_model=Token)
async def client_register(client: ClientRegistrationModel):
    if not validate_phone_number(client.phone_number):
        raise HTTPException(status_code=400, detail="Invalid phone number. Only Russian phone numbers accepted")

    with create_session() as session:
        found_employee = session.query(Credentials).filter_by(email=client.email).first()
        if found_employee:
            raise HTTPException(status_code=400, detail="Email already exists")

        found_client = session.query(Client).filter_by(phone_number=client.phone_number).first()
        if found_client:
            raise HTTPException(status_code=400, detail="Phone number already exists")

        if client.age < 18:
            raise HTTPException(status_code=400, detail="Too young age for registration as a client")

        new_credentials = Credentials(email=client.email, passwd=hash_password(client.password),
                                      role='client')

        session.add(new_credentials)

        new_client = Client(email=client.email, full_name=client.full_name,
                            phone_number=client.phone_number,
                            age=client.age)

        session.add(new_client)

        session.commit()

    access_token = create_access_token(data={"sub": client.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register_participant", summary="Register a participant", response_model=Token)
async def participant_register(participant: ParticipantRegistrationModel):
    if not validate_phone_number(participant.phone_number):
        raise HTTPException(status_code=400, detail="Invalid phone number. Only Russian phone numbers accepted")

    with create_session() as session:
        found_employee = session.query(Credentials).filter_by(email=participant.email).first()
        if found_employee:
            raise HTTPException(status_code=400, detail="Email already exists")

        found_participant = session.query(Participant).filter_by(phone_number=participant.phone_number).first()
        if found_participant:
            raise HTTPException(status_code=400, detail="Phone number already exists")

        if participant.age < 18:
            raise HTTPException(status_code=400, detail="Too young age for registration as a participant")

        new_credentials = Credentials(email=participant.email, passwd=hash_password(participant.password),
                                      role='participant')

        session.add(new_credentials)

        new_participant = Participant(email=participant.email, full_name=participant.full_name,
                                      phone_number=participant.phone_number,
                                      age=participant.age)

        session.add(new_participant)

        session.commit()

    access_token = create_access_token(data={"sub": participant.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.delete("/remove_user", summary="Remove user", response_model=str)
async def remove_user(email: str, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'db admin':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        found_user = session.query(Credentials).filter_by(email=email).first()
        if not found_user:
            raise HTTPException(status_code=400, detail="No user with such email")

        if found_user.role == 'admin':
            raise HTTPException(status_code=410, detail="Forbidden")

        found = None
        if found_user.role == 'admin':
            found = session.query(Admin).filter_by(email=found_user.email).first()
        elif found_user.role == 'event manager':
            found = session.query(EventManager).filter_by(email=found_user.email).first()
        elif found_user.role == 'showman':
            found = session.query(Showman).filter_by(email=found_user.email).first()
        elif found_user.role == 'client':
            found = session.query(Client).filter_by(email=found_user.email).first()
        elif found_user.role == 'participant':
            found = session.query(Participant).filter_by(email=found_user.email).first()
        else:
            raise HTTPException(status_code=400, detail="No user with such email")

        session.delete(found)
        session.delete(found_user)
        session.commit()

        return "User was successfully removed"


@router.get("/get_user", summary="Get all users by filter", response_model=UserResponseModel)
async def get_user(email: str, current_user: Credentials = Depends(get_current_user)):
    if (current_user.role != 'admin' and current_user.role != 'db admin' and current_user.role != 'event manager'
            and current_user.role != 'showman'):
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        user_creds = session.query(Credentials).filter_by(email=email).first()

        if user_creds.role == 'db admin':
            raise HTTPException(status_code=410, detail="Forbidden")

        if user_creds.role == 'admin':
            user = session.query(Admin).filter_by(email=email).first()
        elif user_creds.role == 'event manager':
            user = session.query(EventManager).filter_by(email=email).first()
        elif user_creds.role == 'showman':
            user = session.query(Showman).filter_by(email=email).first()
        elif user_creds.role == 'client':
            user = session.query(Client).filter_by(email=email).first()
        elif user_creds.role == 'participant':
            user = session.query(Participant).filter_by(email=email).first()
        else:
            raise HTTPException(status_code=404, detail="Role not found")

        response = {"full_name": user.full_name, "email": email, "phone_number": user.phone_number,
                    "role": user_creds.role}

        if user_creds.role == 'client' or user_creds.role == 'participant':
            response["age"] = user.age
        elif user_creds.role == 'event manager' or user_creds.role == 'showman':
            response["summary"] = user.description

        return response


@router.get("/get_users", summary="Get all users by filter", response_model=UsersListResponseModel)
async def get_users(query_params: UserSearchParamsModel = Depends(),
                    current_user: Credentials = Depends(get_current_user)):
    if (current_user.role != 'db admin' and current_user.role != 'admin' and current_user.role != 'client'
            and current_user.role != 'showman' and current_user.role != 'event manager'):
        raise HTTPException(status_code=410, detail="Forbidden")

    # Check allowed query full_name param
    full_name_regexp = r'^[а-яА-Я\s]+$'
    if query_params.full_name is not None and not re.match(full_name_regexp, query_params.full_name):
        raise HTTPException(status_code=402, detail="Bad full_name param")

    if query_params.phone_number is not None and not validate_phone_number(query_params.phone_number):
        raise HTTPException(status_code=403, detail="Bad phone_number param")

    users = []
    with create_session() as session:
        creds_query = session.query(Credentials.email, Credentials.role)

        if query_params.role is not None:
            creds_query = creds_query.filter_by(role=query_params.role)
        if query_params.email is not None:
            creds_query = creds_query.filter(Credentials.email.ilike(f"%{query_params.email}%"))

        creds = creds_query.all()

        for c in creds:
            found = None
            if c.role == 'admin':
                found = session.query(Admin).filter_by(email=c.email).first()
            elif c.role == 'event manager':
                found = session.query(EventManager).filter_by(email=c.email).first()
            elif c.role == 'showman':
                found = session.query(Showman).filter_by(email=c.email).first()
            elif c.role == 'client':
                found = session.query(Client).filter_by(email=c.email).first()
            elif c.role == 'participant':
                found = session.query(Participant).filter_by(email=c.email).first()
                if query_params.event_id is not None:
                    invited = session.query(InviteList).filter_by(event_id=query_params.event_id,
                                                                  participant_id=found.id).first()
                    if not invited:
                        continue
            elif c.role == 'db admin':
                continue

            name_regexp = rf'{query_params.full_name}'

            if query_params.full_name is not None and not re.match(name_regexp, found.full_name):
                continue

            if query_params.phone_number is not None and found.phone_number != query_params.phone_number:
                continue

            users.append({"full_name": found.full_name, "email": c.email,
                          "phone_number": found.phone_number, "role": c.role, "id": str(found.id)})

        final_users_list = users[query_params.skip: query_params.skip + query_params.limit]

        return {"count": len(users), "users": final_users_list}


@router.put("/update_guest_user", summary="Update fullname or phone number or age of a user", response_model=str)
async def update_guest_user(updated_user: GuestUpdateModel, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'db admin' and current_user.role != 'admin':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        query = session.query(Credentials).filter_by(email=updated_user.email)

        user_role = query.first().role

        if user_role == 'client':
            user_query = session.query(Client).filter_by(email=updated_user.email)
        elif user_role == 'participant':
            user_query = session.query(Participant).filter_by(email=updated_user.email)
        else:
            raise HTTPException(status_code=406, detail="This method is not allowed for user with such a role")

        if updated_user.age is not None:
            user_query.update({"age": updated_user.age})

        if updated_user.phone_number is not None:
            if validate_phone_number(updated_user.phone_number):
                user_query.update({"phone_number": updated_user.phone_number})
            else:
                raise HTTPException(status_code=405, detail="Invalid phone number")

        if updated_user.full_name is not None:
            user_query.update({"full_name": updated_user.full_name})

        session.commit()

    return "User was successfully updated"


@router.put("/update_employee_user",
            summary="Update fullname or phone number or summary of a user", response_model=str)
async def update_employee_user(updated_user: EmployeeUpdateModel,
                               current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'db admin' and current_user.role != 'admin':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        query = session.query(Credentials).filter_by(email=updated_user.email)

        user_role = query.first().role

        if user_role == 'event manager':
            user_query = session.query(EventManager).filter_by(email=updated_user.email)
        elif user_role == 'showman':
            user_query = session.query(Showman).filter_by(email=updated_user.email)
        else:
            raise HTTPException(status_code=406, detail="This method is not allowed for user with such a role")

        if updated_user.summary is not None:
            user_query.update({"description": updated_user.summary})

        if updated_user.phone_number is not None:
            if validate_phone_number(updated_user.phone_number):
                user_query.update({"phone_number": updated_user.phone_number})
            else:
                raise HTTPException(status_code=405, detail="Invalid phone number")

        if updated_user.full_name is not None:
            user_query.update({"full_name": updated_user.full_name})

        session.commit()

    return "User was successfully updated"


@router.put("/update_admin_user", summary="Update fullname or phone number of a user", response_model=str)
async def update_admin_user(updated_user: UserUpdateModel, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'db admin' and current_user.role != 'admin':
        raise HTTPException(status_code=410, detail="Forbidden")

    with create_session() as session:
        query = session.query(Credentials).filter_by(email=updated_user.email)

        user_role = query.first().role

        if user_role == 'admin':
            if current_user.role == 'admin' and updated_user.email != current_user.email:
                raise HTTPException(status_code=410, detail="Forbidden")
        else:
            raise HTTPException(status_code=406, detail="This method is not allowed for user with such a role")

        user_query = session.query(Admin).filter_by(email=updated_user.email)

        if updated_user.phone_number is not None:
            if validate_phone_number(updated_user.phone_number):
                user_query.update({"phone_number": updated_user.phone_number})
            else:
                raise HTTPException(status_code=405, detail="Invalid phone number")

        if updated_user.full_name is not None:
            user_query.update({"full_name": updated_user.full_name})

        session.commit()

    return "User was successfully updated"
