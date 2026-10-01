import { getAuthenticatedUser } from "./getAuthenticatedUser";

/**
 * Database-driven Maternal & Child Health write access.
 * No hard-coded department names.
 */

function hasMchCreate(user) {
  if (!user) return false;
  return user.permissions?.maternalChildHealth?.create === true;
}

function hasMchRead(user) {
  if (!user) return false;
  return user.permissions?.maternalChildHealth?.read === true;
}

/** @deprecated Prefer permission checks. Always returns false. */
export function isMchOrGeneralDepartment(departmentName) {
  return false;
}

export async function canWriteMaternalChildHealth() {
  const user = await getAuthenticatedUser();
  return hasMchCreate(user);
}

export function canWriteMaternalChildHealthFromUser(user) {
  return hasMchCreate(user);
}

export async function canAccessMaternalChildHealth() {
  const user = await getAuthenticatedUser();
  return hasMchRead(user);
}

export function canAccessMaternalChildHealthFromUser(user) {
  return hasMchRead(user);
}

export default canWriteMaternalChildHealth;
