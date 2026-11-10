import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

# backend/.env 읽기
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)


def get_connection():
    """PostgreSQL 데이터베이스 연결을 반환합니다."""
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )