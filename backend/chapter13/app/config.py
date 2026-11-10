import os
from pathlib import Path

from dotenv import load_dotenv

# backend/.env 하나만 읽음 (app → chapter13 → backend)
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)


def _require(name: str) -> str:
    """필수 환경변수가 없으면 서버 시작 시점에 바로 알려줌"""
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"환경변수 {name}가 설정되지 않았습니다. ({ENV_PATH})")
    return value


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


# ---------- Database (Server Secret 포함) ----------
DB_HOST = _require("DB_HOST")
DB_PORT = _require("DB_PORT")
DB_NAME = _require("DB_NAME")
DB_USER = _require("DB_USER")
DB_PASSWORD = _require("DB_PASSWORD")

DATABASE_URL = (
    f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# ---------- CORS ----------
CORS_ORIGINS: list[str] = _split_csv(os.getenv("CORS_ORIGINS", ""))