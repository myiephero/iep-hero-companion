export type Role = "parent" | "advocate";

export function isRole(v: unknown): v is Role {
  return v === "parent" || v === "advocate";
}