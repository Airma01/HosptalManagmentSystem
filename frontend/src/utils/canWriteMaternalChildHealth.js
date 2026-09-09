import { getAuthenticatedUser } from "./getAuthenticatedUser";

/**
 * Department names that may CREATE / UPDATE / DELETE Maternal & Child Health data.
 * Matches backend DoctorMaternalChildHealthController write authorization.
 * ClinicalDepartment only has DepartmentName (no code field).
 */
const ALLOWED_EXACT = new Set([
  "MCH",
  "GENERAL",
  "MATERNAL & CHILD HEALTH",
  "MATERNAL AND CHILD HEALTH",
  "MATERNAL CHILD HEALTH",
]);

/**
 * @param {string | null | undefined} departmentName
 * @returns {boolean}
 */
export function isMchOrGeneralDepartment(departmentName) {
  if (!departmentName || typeof departmentName !== "string") return false;
  const n = departmentName.trim().toUpperCase();
  if (ALLOWED_EXACT.has(n)) return true;
  // Fallback for common variants that include both "maternal" and "child"
  return n.includes("MATERNAL") && n.includes("CHILD");
}

/**
 * Async check using the existing getAuthenticatedUser() helper.
 * Uses departmentName from /Hospital/doctor/DoctorAuth/auth_me (and localStorage cache).
 * @returns {Promise<boolean>}
 */
export async function canWriteMaternalChildHealth() {
  const user = await getAuthenticatedUser();
  if (!user) return false;
  return isMchOrGeneralDepartment(user.departmentName);
}

/**
 * Sync check when the user object is already available.
 * @param {{ departmentName?: string } | null | undefined} user
 * @returns {boolean}
 */
export function canWriteMaternalChildHealthFromUser(user) {
  if (!user) return false;
  return isMchOrGeneralDepartment(user.departmentName);
}

export default canWriteMaternalChildHealth;
