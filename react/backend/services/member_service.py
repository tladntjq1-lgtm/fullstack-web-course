from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.repositories import member_repository
from backend.schemas import MemberCreate, MemberPatch, MemberUpdate


def get_members_service(db: Session):
    return member_repository.find_all(db)


def get_member_service(db: Session, member_id: int):
    member = member_repository.find_by_id(db, member_id)

    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")

    return member


def create_member_service(db: Session, payload: MemberCreate):
    existing = member_repository.find_by_email(db, str(payload.email))

    if existing is not None:
        raise HTTPException(status_code=409, detail="Email already exists")

    try:
        return member_repository.create_member(
            db,
            payload.name,
            str(payload.email),
            payload.age,
            payload.gender,
        )
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Email already exists")


def update_member_service(
    db: Session,
    member_id: int,
    payload: MemberUpdate,
):
    member = member_repository.find_by_id(db, member_id)

    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")

    existing = member_repository.find_by_email(db, str(payload.email))
    if existing is not None and existing.member_id != member_id:
        raise HTTPException(status_code=409, detail="Email already exists")

    try:
        return member_repository.update_member(db, member, payload)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Email already exists")


def patch_member_service(
    db: Session,
    member_id: int,
    payload: MemberPatch,
):
    changes = payload.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="At least one field is required",
        )

    member = member_repository.find_by_id(db, member_id)

    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")

    if "email" in changes:
        existing = member_repository.find_by_email(
            db,
            str(changes["email"]),
        )
        if existing is not None and existing.member_id != member_id:
            raise HTTPException(status_code=409, detail="Email already exists")

    try:
        return member_repository.patch_member(db, member, payload)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Email already exists")


def delete_member_service(db: Session, member_id: int):
    member = member_repository.find_by_id(db, member_id)

    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")

    member_repository.delete_member(db, member)