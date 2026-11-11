import type { Gender } from "../types/member";

// 화면에 보여 줄 성별 선택지 (DB에는 value 값이 저장됩니다)
export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "other", label: "기타" },
];

export function isGender(value: unknown): value is Gender {
  return value === "male" || value === "female" || value === "other";
}

export function genderLabel(gender: Gender | null): string {
  const found = GENDER_OPTIONS.find((option) => option.value === gender);
  return found ? found.label : "성별 미입력";
}