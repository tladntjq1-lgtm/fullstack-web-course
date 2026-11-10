from fastapi import FastAPI, HTTPException, Response, status

from backend.common.db import get_connection


app = FastAPI(title="Chapter 09 - Delete Member")


@app.get("/members/{member_id}")
def get_member(member_id: int):
    conn = get_connection()

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT member_id, name, email, age
                FROM members
                WHERE member_id = %s
                """,
                (member_id,),
            )
            row = cur.fetchone()

        if row is None:
            raise HTTPException(
                status_code=404,
                detail="Member not found",
            )

        return {
            "member_id": row[0],
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


@app.delete(
    "/members/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_member(member_id: int):
    conn = get_connection()

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM members
                WHERE member_id = %s
                RETURNING member_id
                """,
                (member_id,),
            )
            deleted = cur.fetchone()

            if deleted is None:
                raise HTTPException(
                    status_code=404,
                    detail="Member not found",
                )

            conn.commit()

        return Response(status_code=status.HTTP_204_NO_CONTENT)

    except HTTPException:
        conn.rollback()
        raise

    except Exception:
        conn.rollback()
        raise HTTPException(
            status_code=500,
            detail="회원 삭제 중 오류가 발생했습니다.",
        )

    finally:
        conn.close()