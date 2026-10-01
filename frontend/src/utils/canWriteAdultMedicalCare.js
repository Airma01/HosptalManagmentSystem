import { getAuthenticatedUser } from "./getAuthenticatedUser";

/**
 * Database-driven Adult Medical Care write access.
 * No hard-coded department names.
 */

function hasAdultCreate(user) {
  if (!user) return false;
  return user.permissions?.adultMedicalCare?.create === true;
}

function hasAdultRead(user) {
  if (!user) return false;
  return user.permissions?.adultMedicalCare?.read === true;
}

export function normalizeDepartmentName(departmentName) {
  return departmentName?.trim().toLowerCase() || "";
}

/** @deprecated Prefer permission checks. Always returns false. */
export function isAdultMedicalCareDepartment(departmentName) {
  return false;
}

export async function canWriteAdultMedicalCare() {
  const user = await getAuthenticatedUser();
  return hasAdultCreate(user);
}

export function canWriteAdultMedicalCareFromUser(user) {
  return hasAdultCreate(user);
}

export async function canAccessAdultMedicalCare() {
  const user = await getAuthenticatedUser();
  return hasAdultRead(user);
}

export function canAccessAdultMedicalCareFromUser(user) {
  return hasAdultRead(user);
}

export default canWriteAdultMedicalCare;
