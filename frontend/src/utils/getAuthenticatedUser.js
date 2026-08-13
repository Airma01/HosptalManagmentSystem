import API from '../Config/API';

let cachedUser = null;

/**
 * Fetches the authenticated user from the backend.
 * Returns cached data, then localStorage, then calls /auth_me.
 */
export const getAuthenticatedUser = async () => {
  // If already cached in memory, return it
  if (cachedUser) return cachedUser;

  // Check localStorage first
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // If we have doctorID, assume it's valid
      if (parsed.doctorID) {
        cachedUser = parsed;
        return parsed;
      }
    } catch (e) {
      // ignore
    }
  }

  // Otherwise fetch from auth_me
  try {
    const res = await API.get('/Hospital/doctor/DoctorAuth/auth_me');
    const userData = res.data;

    // Validate required fields (optional)
    if (!userData.doctorID) {
      console.warn('auth_me response missing doctorID', userData);
    }

    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    cachedUser = userData;
    return userData;
  } catch (err) {
    console.error('Failed to fetch authenticated user:', err);
    return null;
  }
};