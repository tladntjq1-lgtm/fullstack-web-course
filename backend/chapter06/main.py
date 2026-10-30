from fastapi import FastAPI
from pydantic import BaseModel
from database import get_connection

app = FastAPI()


class MemberResponse(BaseModel):
    member_id: int
    name: str
    email: str


@app.get("/members", response_model=list[MemberResponse])
def get_members():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT member_id, name, email
                FROM members
                ORDER BY member_id
                """
            )
            members = cur.fetchall()
    return members