import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../Config/API';

// Map roles to login & auth_me endpoints
const roleConfig = {
  Doctor: {
    login: '/Hospital/doctor/DoctorAuth/doctor_login',
    me: '/Hospital/doctor/DoctorAuth/auth_me',
    redirect: '/doctor',
  },
  Receptionist: {
    login: '/receptionist/ReceptionistAuth/receptionist_login',
    me: '/receptionist/ReceptionistAuth/auth_me',
    redirect: '/receptionist',
  },
  Nurse: {
    login: '/Hospital/nurse/NurseAuth/nurse_login',
    me: '/Hospital/nurse/NurseAuth/auth_me',
    redirect: '/nurse',
  },
  // 🆕 CSM (Central Store Manager)
  CSM: {
    login: '/Hospital/CSM/CSMAuth/CSM_login',
    me: '/Hospital/CSM/CSMAuth/auth_me',
    redirect: '/csm/dashboard',
  },
  // 🆕 Pharmacist
  Pharmacist: {
    login: '/Hospital/Pharmacist/PharmacistAuth/pharmacist_login',
    me: '/Hospital/Pharmacist/PharmacistAuth/auth_me',
    redirect: '/pharmacy',
  },
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Doctor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const config = roleConfig[selectedRole];
    if (!config) {
      setError('Invalid role selected.');
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Login – sets the HttpOnly cookie
      await API.post(config.login, { username, password });

      // 2️⃣ Fetch authenticated user info (cookie is sent automatically)
      const meRes = await API.get(config.me);
      const userData = meRes.data;

      // 3️⃣ Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', selectedRole);

      // 4️⃣ Redirect to the dashboard
      navigate(config.redirect, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data?.message || 'Login failed. Please try again.');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-white/30 transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">MediCare</h1>
          <p className="text-gray-500 text-sm mt-1">Secure role‑based access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition bg-white/80"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition bg-white/80"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select your role</label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full appearance-none bg-white/80 border border-gray-300 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition cursor-pointer"
              >
                <option value="Doctor">👨‍⚕️ Doctor</option>
                <option value="Receptionist">📋 Receptionist</option>
                <option value="Nurse">🩺 Nurse</option>
                <option value="CSM">🏢 CSM (Central Store Manager)</option>
                <option value="Pharmacist">💊 Pharmacist</option>
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2.5 rounded-xl border border-red-200 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#4f46e5', border: 'none' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Use real credentials for your role.
        </p>
      </div>
    </div>
  );
}