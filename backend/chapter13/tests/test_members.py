from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_members_returns_200():
    response = client.get("/members")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_unknown_member_returns_404():
    response = client.get("/members/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Member not found"


def test_member_id_validation_returns_422():
    response = client.get("/members/not-a-number")

    assert response.status_code == 422


def test_create_member_returns_201():
    email = f"test-{uuid4()}@example.com"

    response = client.post(
        "/members",
        json={
            "name": "Test User",
            "email": email,
            "age": 30,
        },
    )

    assert response.status_code == 201

    body = response.json()
    assert body["name"] == "Test User"
    assert body["email"] == email