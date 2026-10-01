import { getAuthenticatedUser } from "./getAuthenticatedUser";

/**
 * Database-driven Consultation access.
 * Uses permissions returned by /auth_me for the doctor's active department.
 * No hard-coded department names.
 */

function hasConsultationRead(user) {
  if (!user) return false;
  const p = user.permissions?.consultation;
  if (p && typeof p.read === "boolean") return p.read === true;
  // Backward-compatible fallback while permissions are being configured
  return false;
}

export function isConsultationDepartment(departmentName) {
  // Deprecated: kept for call-site compatibility. Prefer permission checks.
  // Always returns false so no hard-coded names grant access.
  return false;
}

export async function canAccessConsultation() {
  const user = await getAuthenticatedUser();
  return hasConsultationRead(user);
}

export function canAccessConsultationFromUser(user) {
  return hasConsultationRead(user);
}

export function canCreateConsultationFromUser(user) {
  if (!user) return false;
  return user.permissions?.consultation?.create === true;
}

export function canUpdateConsultationFromUser(user) {
  if (!user) return false;
  return user.permissions?.consultation?.update === true;
}

export function canDeleteConsultationFromUser(user) {
  if (!user) return false;
  return user.permissions?.consultation?.delete === true;
}

export default canAccessConsultation;
