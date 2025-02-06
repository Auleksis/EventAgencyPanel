from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.place.schemas import *

from app.database import *
from app.utils import check_password, hash_password, validate_phone_number
from app.auth import create_access_token, get_current_user

router = APIRouter(prefix='/place', tags=['Place management'])


@router.post("/add_place", summary="Add new place available for events", response_model=PlaceResponseModel)
async def add_place(place: PlaceCreateRequestModel, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin':
        raise HTTPException(status_code=415, detail="Forbidden")

    if place.capacity <= 0:
        raise HTTPException(status_code=416, detail="Capacity must be greater than 0")

    with create_session() as session:
        existing_place = session.query(Place).filter_by(name=place.name).first()
        if existing_place is not None:
            raise HTTPException(status_code=417, detail="Place with such name already exists")

        new_place = Place(name=place.name, description=place.description,
                          capacity=place.capacity, address=place.address)

        session.add(new_place)
        session.commit()

        new_place = session.query(Place).filter_by(name=place.name).first()

    return {"id": str(new_place.id), "name": new_place.name, "description": new_place.description,
            "capacity": new_place.capacity, "address": new_place.address}


@router.put("/update_place", summary="Update place info", response_model=PlaceResponseModel)
async def update_place(place: PlaceUpdateRequestModel, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin':
        raise HTTPException(status_code=419, detail="Forbidden")

    if place.capacity <= 0:
        raise HTTPException(status_code=420, detail="Capacity must be greater than 0")

    with create_session() as session:
        found_place = session.query(Place).filter_by(id=place.id).first()

        if found_place is None:
            raise HTTPException(status_code=421, detail="No place with such id")

        updated_data = place.dict(exclude_none=True)
        session.query(Place).filter_by(id=place.id).update(updated_data)
        session.commit()

        found_place = session.query(Place).filter_by(id=place.id).first()

    return {"id": str(found_place.id), "name": found_place.name, "description": found_place.description,
            "capacity": found_place.capacity, "address": found_place.address}


@router.get("/get_places", summary="Get short info about all places", response_model=PlaceListModel)
async def get_places(params: PlaceSearchModel = Depends(), current_user: Credentials = Depends(get_current_user)):
    with create_session() as session:
        places_query = session.query(Place)

        if params.name is not None:
            places_query = places_query.filter(Place.name.ilike(f"%{params.name}%"))
        if params.address is not None:
            places_query = places_query.filter(Place.address.ilike(f"%{params.address}%"))
        if params.capacity is not None:
            places_query = places_query.filter(Place.capacity >= params.capacity)

    places = places_query.all()

    final_list = places[params.skip: params.skip + params.limit]

    return {"count": len(places), "places":
        [{"id": str(p.id), "name": p.name, "address": p.address, "capacity": p.capacity} for p in final_list]}


@router.get("/get_place", summary="Get specified place info", response_model=PlaceResponseModel)
async def get_place(place_id: str, current_user: Credentials = Depends(get_current_user)):
    with create_session() as session:
        found_place = session.query(Place).filter_by(id=place_id).first()
        if found_place is None:
            raise HTTPException(status_code=412, detail="No place with such id")

    return {"id": str(found_place.id), "name": found_place.name, "description": found_place.description,
            "capacity": found_place.capacity, "address": found_place.address}


@router.delete("/remove_place", summary="Get specified place info", response_model=str)
async def remove_place(place_id: str, current_user: Credentials = Depends(get_current_user)):
    if current_user.role != 'admin' and current_user.role != 'db admin':
        raise HTTPException(status_code=423, detail="Forbidden")

    with create_session() as session:
        found_place = session.query(Place).filter_by(id=place_id).first()
        if found_place is None:
            raise HTTPException(status_code=424, detail="No place with such id")

        session.delete(found_place)
        session.commit()

    return "Place was successfully removed"
