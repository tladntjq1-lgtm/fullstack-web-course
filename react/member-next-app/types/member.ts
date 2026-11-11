export type Gender = "male" | "female" | "other";

export type Member = {
  member_id: number;
  name: string;
  email: string;
  age: number;
  gender: Gender | null;
};