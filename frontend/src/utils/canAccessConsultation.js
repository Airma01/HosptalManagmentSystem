import { getAuthenticatedUser } from "./getAuthenticatedUser";

/**
 * Departments allowed to open Consultation Queue / Patient.
 * Case-insensitive; trim applied. Edit to match your DB names.
 */
const ALLOWED_EXACT = new Set([
  "GENERAL",
  "ADULT",
  "GENRAL",
  "GENERAL MEDICINE",
  "EMERGENCY",
  "INTERNAL MEDICINE",
  "OUTPATIENT",
  "OPD",
]);

export function isConsultationDepartment(departmentName) {
  if (!departmentName || typeof departmentName !== "string") return false;
  const n = departmentName.trim().toUpperCase();
  if (ALLOWED_EXACT.has(n)) return true;
  if (n.includes("GENERAL") && n.includes("MEDICINE")) return true;
  if (n.includes("INTERNAL") && n.includes("MEDICINE")) return true;
  if (n === "EMERGENCY") return true;
  return false;
}

export async function canAccessConsultation() {
  const user = await getAuthenticatedUser();
  if (!user) return false;
  return isConsultationDepartment(user.departmentName);
}

export function canAccessConsultationFromUser(user) {
  if (!user) return false;
  return isConsultationDepartment(user.departmentName);
}

export default canAccessConsultation;