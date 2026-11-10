from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, Field, model_validator

from backend.common.db import get_connection


app = FastAPI(title="Chapter 08 - PUT/PATCH")


class MemberUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(ge=0, le=150)


class MemberPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    age: int | None = Field(default=None, ge=0, le=150)

    @model_validator(mode="after")
    def reject_explicit_null(self):
        for field in self.model_fields_set:
            if getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class MemberResponse(MemberUpdate):
    id: int


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
                detail="Member not found",
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


@app.put("/members/{member_id}", response_model=MemberResponse)
def update_member(member_id: int, member: MemberUpdate):
    conn = get_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT member_id FROM members WHERE member_id = %s",
                (member_id,),
            )

            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Member not found")

            cursor.execute(
                """
                SELECT member_id
                FROM members
                WHERE email = %s AND member_id <> %s
                """,
                (str(member.email), member_id),
            )

            if cursor.fetchone() is not None:
                raise HTTPException(status_code=409, detail="Email already exists")

            cursor.execute(
                """
                UPDATE members
                SET name = %s,
                    email = %s,
                    age = %s
                WHERE member_id = %s
                RETURNING member_id, name, email, age
                """,
                (member.name, str(member.email), member.age, member_id),
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
            detail="회원 수정 중 오류가 발생했습니다.",
        )

    finally:
        conn.close()


@app.patch("/members/{member_id}", response_model=MemberResponse)
def patch_member(member_id: int, member: MemberPatch):
    changes = member.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="At least one field is required",
        )

    conn = get_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT member_id FROM members WHERE member_id = %s",
                (member_id,),
            )

            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Member not found")

            if "email" in changes:
                cursor.execute(
                    """
                    SELECT member_id
                    FROM members
                    WHERE email = %s AND member_id <> %s
                    """,
                    (str(changes["email"]), member_id),
                )

                if cursor.fetchone() is not None:
                    raise HTTPException(status_code=409, detail="Email already exists")

            allowed_fields = {
                "name": "name",
                "email": "email",
                "age": "age",
            }

            set_parts = []
            values = []

            for field, value in changes.items():
                column = allowed_fields[field]
                set_parts.append(f"{column} = %s")
                values.append(str(value) if field == "email" else value)

            values.append(member_id)

            sql = f"""
                UPDATE members
                SET {", ".join(set_parts)}
                WHERE member_id = %s
                RETURNING member_id, name, email, age
            """

            cursor.execute(sql, values)
            row = cursor.fetchone()

            if row is None:
                raise HTTPException(status_code=404, detail="Member not found")

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
            detail="회원 수정 중 오류가 발생했습니다.",
        )

    finally:
        conn.close()