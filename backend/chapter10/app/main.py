from fastapi import FastAPI

from app.routers import members


app = FastAPI()
app.include_router(members.router)