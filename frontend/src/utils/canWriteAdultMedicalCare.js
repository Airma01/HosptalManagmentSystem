import { getAuthenticatedUser } from "./getAuthenticatedUser";

const ALLOWED_EXACT = new Set([
  "GENERAL MEDICINE",
  "GENRAL",
  "GENERAL",
  "EMERGENCY",
  
]);

export function normalizeDepartmentName(departmentName) {
  return departmentName?.trim().toLowerCase() || "";
}

export function isAdultMedicalCareDepartment(departmentName) {
  if (!departmentName || typeof departmentName !== "string") return false;
  const n = departmentName.trim().toUpperCase();
  if (ALLOWED_EXACT.has(n)) return true;
  const lower = n.toLowerCase();
  if (lower === "general medicine" || lower === "general") return true;
  if (lower === "emergency") return true;
  return false;
}

export async function canWriteAdultMedicalCare() {
  const user = await getAuthenticatedUser();
  if (!user) return false;
  return isAdultMedicalCareDepartment(user.departmentName);
}

export function canWriteAdultMedicalCareFromUser(user) {
  if (!user) return false;
  return isAdultMedicalCareDepartment(user.departmentName);
}

export const canAccessAdultMedicalCare = canWriteAdultMedicalCare;

export default canWriteAdultMedicalCare;