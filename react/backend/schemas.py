from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class MemberCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(ge=0, le=150)


class MemberUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(ge=0, le=150)


class MemberPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    age: int | None = Field(default=None, ge=0, le=150)

    @model_validator(mode="before")
    @classmethod
    def reject_explicit_null(cls, data: Any):
        if isinstance(data, dict):
            for field in ("name", "email", "age"):
                if field in data and data[field] is None:
                    raise ValueError(f"{field} cannot be null")
        return data


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    member_id: int
    name: str
    email: EmailStr
    age: int