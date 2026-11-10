from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.routers import member_router

app = FastAPI()

# 허용 Origin은 코드가 아니라 .env의 CORS_ORIGINS에서 읽음
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(member_router.router)