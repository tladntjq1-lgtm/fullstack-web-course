from fastapi import HTTPException

from app.repositories import member_repository
from app.schemas import MemberPatch, MemberUpdate


def get_members():
    return member_repository.find_all()


def get_member(member_id: int):
    member = member_repository.find_by_id(member_id)

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    return member


def create_member(data):
    if member_repository.exists_by_email(str(data.email)):
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        )

    return member_repository.create(data)


def update_member(member_id: int, data: MemberUpdate):
    member = member_repository.find_by_id(member_id)

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    if member_repository.exists_by_email(
        str(data.email),
        exclude_member_id=member_id,
    ):
        raise HTTPException(
            status_code=409,
            detail="Email already exists",
        )

    updated = member_repository.update(
        member_id,
        data.model_dump(),
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    return updated


def patch_member(member_id: int, data: MemberPatch):
    changes = data.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="At least one field is required",
        )

    member = member_repository.find_by_id(member_id)

    if member is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    if "email" in changes:
        if member_repository.exists_by_email(
            str(changes["email"]),
            exclude_member_id=member_id,
        ):
            raise HTTPException(
                status_code=409,
                detail="Email already exists",
            )

    updated = member_repository.update(member_id, changes)

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )

    return updated


def delete_member(member_id: int):
    deleted = member_repository.delete(member_id)

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Member not found",
        )