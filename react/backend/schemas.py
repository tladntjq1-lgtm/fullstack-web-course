from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

# 성별은 이 3개 값만 허용합니다. (DB CHECK 제약과 같은 값)
Gender = Literal["male", "female", "other"]


class MemberCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(ge=0, le=150)
    gender: Gender | None = None


class MemberUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    age: int = Field(ge=0, le=150)
    gender: Gender | None = None


class MemberPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    age: int | None = Field(default=None, ge=0, le=150)
    gender: Gender | None = None

    @model_validator(mode="before")
    @classmethod
    def reject_explicit_null(cls, data: Any):
        # gender는 null로 보내면 "성별 지우기"로 허용하므로 검사 목록에 넣지 않습니다.
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
    gender: Gender | None = None