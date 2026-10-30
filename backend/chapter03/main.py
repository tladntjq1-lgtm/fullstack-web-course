from pydantic import BaseModel

class MemberCreate(BaseModel):
    id: int
    name: str
    email: str
    age: int



from fastapi import FastAPI, status
import random

app = FastAPI()

@app.post("/members", status_code=status.HTTP_201_CREATED)
def create_member(member: MemberCreate):
    number = random.randint(1, 100)
    member.id = number
    return member
