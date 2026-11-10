from contextlib import closing

from psycopg2.extras import RealDictCursor

from app.db import get_connection


def find_all():
    with closing(get_connection()) as conn:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT member_id, name, email, age
                    FROM members
                    ORDER BY member_id
                    """
                )
                return cur.fetchall()


def find_by_id(member_id: int):
    with closing(get_connection()) as conn:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT member_id, name, email, age
                    FROM members
                    WHERE member_id = %s
                    """,
                    (member_id,),
                )
                return cur.fetchone()


def exists_by_email(
    email: str,
    exclude_member_id: int | None = None,
) -> bool:
    with closing(get_connection()) as conn:
        with conn:
            with conn.cursor() as cur:
                if exclude_member_id is None:
                    cur.execute(
                        "SELECT 1 FROM members WHERE email = %s",
                        (email,),
                    )
                else:
                    cur.execute(
                        """
                        SELECT 1
                        FROM members
                        WHERE email = %s AND member_id <> %s
                        """,
                        (email, exclude_member_id),
                    )

                return cur.fetchone() is not None


def create(data):
    with closing(get_connection()) as conn:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    INSERT INTO members (name, email, age, created_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                    RETURNING member_id, name, email, age
                    """,
                    (data.name, str(data.email), data.age),
                )
                created = cur.fetchone()
                conn.commit()
                return created


def update(member_id: int, changes: dict):
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

    with closing(get_connection()) as conn:
        with conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql, values)
                updated = cur.fetchone()
                conn.commit()
                return updated


def delete(member_id: int):
    with closing(get_connection()) as conn:
        with conn:
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
                conn.commit()
                return deleted