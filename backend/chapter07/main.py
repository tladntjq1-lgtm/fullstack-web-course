from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, Field

from backend.common.db import get_connection


app = FastAPI(title="Chapter 07 - Members")


class MemberCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(ge=0, le=150)


class MemberResponse(MemberCreate):
    id: int


INSERT_MEMBER_SQL = """
INSERT INTO members (name, email, age, created_at)
VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
RETURNING member_id, name, email, age
"""


@app.get("/members", response_model=list[MemberResponse])
def get_members():
    conn = get_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT member_id, name, email, age
                FROM members
                ORDER BY member_id
                """
            )
            rows = cursor.fetchall()

            return [
                {
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "age": row[3],
                }
                for row in rows
            ]

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="회원 목록 조회 중 오류가 발생했습니다.",
        )

    finally:
        conn.close()


@app.get("/members/{member_id}", response_model=MemberResponse)
def get_member(member_id: int):
    conn = get_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT member_id, name, email, age
                FROM members
                WHERE member_id = %s
                """,
                (member_id,),
            )
            row = cursor.fetchone()

        if row is None:
            raise HTTPException(
                status_code=404,
                detail="회원을 찾을 수 없습니다.",
            )

        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "age": row[3],
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="회원 조회 중 오류가 발생했습니다.",
        )

    finally:
        conn.close()


@app.post(
    "/members",
    response_model=MemberResponse,
    status_code=201,
)
def create_member(member: MemberCreate):
    conn = get_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT member_id FROM members WHERE email = %s",
                (member.email,),
            )

            if cursor.fetchone():
                raise HTTPException(
                    status_code=409,
                    detail="이미 등록된 이메일입니다.",
                )

            cursor.execute(
                INSERT_MEMBER_SQL,
                (member.name, member.email, member.age),
            )
            row = cursor.fetchone()

            conn.commit()

            return {
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "age": row[3],
            }

    except HTTPException:
        conn.rollback()
        raise

    except Exception:
        conn.rollback()
        raise HTTPException(
            status_code=500,
            detail="회원 등록 중 오류가 발생했습니다.",
        )

    finally:
        conn.close()