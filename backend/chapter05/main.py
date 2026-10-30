from db import check_connection, fetch_members

print(check_connection())

members = fetch_members()

for member in members:
    print(member)

# STEP 11: DB 결과의 실제 타입 확인
print("members 타입:", type(members))
print("한 행의 타입:", type(members[0]))

# Tuple -> Dict 변환 (다음 강의에서 JSON Response로 이어지는 형태)
member_dicts = [
    {"member_id": m[0], "name": m[1], "email": m[2]}
    for m in members
]
print(member_dicts[0])