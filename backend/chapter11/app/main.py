from fastapi import FastAPI, HTTPException
from sqlalchemy import select

from app.db import SessionLocal
from app.models import Member


app = FastAPI(title="Chapter 11 - SQLAlchemy ORM")


@app.get("/members")
def get_members():
    with SessionLocal() as session:
        members = session.scalars(
            select(Member).order_by(Member.member_id)
        ).all()

        return [
            {
                "member_id": member.member_id,
                "name": member.name,
                "email": member.email,
                "age": member.age,
            }
            for member in members
        ]


@app.get("/members/{member_id}")
def get_member(member_id: int):
    with SessionLocal() as session:
        member = session.scalar(
            select(Member).where(Member.member_id == member_id)
        )

        if member is None:
            raise HTTPException(
                status_code=404,
                detail="Member not found",
            )

        return {
            "member_id": member.member_id,
            "name": member.name,
            "email": member.email,
            "age": member.age,
        }