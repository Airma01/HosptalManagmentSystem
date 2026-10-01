import API from '../Config/API';

let cachedUser = null;

/**
 * Clears the in-memory and localStorage cache.
 * Call after a successful department switch so the next fetch gets fresh data.
 */
export const clearAuthenticatedUserCache = () => {
  cachedUser = null;
  localStorage.removeItem('user');
};

/**
 * Fetches the authenticated user from the backend.
 * Returns cached data, then localStorage, then calls /auth_me.
 * Supports the new multi-department fields: departments, activeDepartment.
 */
export const getAuthenticatedUser = async (forceRefresh = false) => {
  if (!forceRefresh && cachedUser) return cachedUser;

  if (!forceRefresh) {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.doctorID) {
          cachedUser = parsed;
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  try {
    const res = await API.get('/Hospital/doctor/DoctorAuth/auth_me');
    const userData = res.data;

    if (!userData.doctorID) {
      console.warn('auth_me response missing doctorID', userData);
    }

    // Normalize: ensure departmentID / departmentName are always present for existing helpers
    if (userData.activeDepartment) {
      userData.departmentID = userData.activeDepartment.departmentID ?? userData.departmentID;
      userData.departmentName = userData.activeDepartment.departmentName ?? userData.departmentName;
    }

    localStorage.setItem('user', JSON.stringify(userData));
    cachedUser = userData;
    return userData;
  } catch (err) {
    console.error('Failed to fetch authenticated user:', err);
    return null;
  }
};

export default getAuthenticatedUser;
