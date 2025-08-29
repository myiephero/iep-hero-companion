import { Role, isRole } from "./roles";

const KEY = "miephero_active_role";
let _role: Role | null = null;

export function getRole(): Role | null {
  if (_role) return _role;
  const raw = localStorage.getItem(KEY);
  if (raw && isRole(raw)) _role = raw;
  return _role;
}

export function setRole(role: Role) {
  _role = role;
  localStorage.setItem(KEY, role);
}

export function clearRole() {
  _role = null;
  localStorage.removeItem(KEY);
}