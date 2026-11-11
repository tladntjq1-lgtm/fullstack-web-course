import type { Member } from "../types/member";
import { isGender } from "./gender";

// 실제 Swagger 경로에 맞춥니다. 예: "/members/" 또는 "/api/v1/members"
const MEMBERS_PATH = "/members";

export type MemberPayload = Pick<Member, "name" | "email" | "age" | "gender">;

function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL을 설정해 주세요.");
  }
  return base.replace(/\/$/, "") + path;
}

function isMember(value: unknown): value is Member {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.member_id === "number" &&
    typeof item.name === "string" &&
    typeof item.email === "string" &&
    typeof item.age === "number" &&
    (item.gender === null || isGender(item.gender))
  );
}

async function requireOk(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error("회원 API 요청 실패: HTTP " + response.status);
  }
}

export async function getMembers(signal?: AbortSignal): Promise<Member[]> {
  const response = await fetch(apiUrl(MEMBERS_PATH), {
    cache: "no-store",
    signal,
  });
  await requireOk(response);

  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isMember)) {
    throw new Error("회원 목록 응답이 예상한 Member[] 형태가 아닙니다.");
  }
  return data;
}

export async function createMember(body: MemberPayload): Promise<void> {
  const response = await fetch(apiUrl(MEMBERS_PATH), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await requireOk(response);
}

export async function updateMember(
  memberId: number,
  body: MemberPayload,
): Promise<void> {
  const response = await fetch(apiUrl(MEMBERS_PATH + "/" + memberId), {
    method: "PUT", // Backend가 PATCH를 지원한다면 계약에 맞게 변경
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await requireOk(response);
}

export async function deleteMember(memberId: number): Promise<void> {
  const response = await fetch(apiUrl(MEMBERS_PATH + "/" + memberId), {
    method: "DELETE",
  });
  // 204 No Content처럼 응답 본문이 없는 성공도 처리합니다.
  await requireOk(response);
}

export async function getMember(
  memberId: number,
  signal?: AbortSignal,
): Promise<Member> {
  const detailPath = MEMBERS_PATH.replace(/\/$/, "") + "/" + memberId;
  const response = await fetch(apiUrl(detailPath), {
    cache: "no-store",
    signal,
  });
  await requireOk(response);

  const data: unknown = await response.json();
  if (!isMember(data)) {
    throw new Error("회원 상세 응답이 예상한 Member 형식이 아닙니다.");
  }
  return data;
}