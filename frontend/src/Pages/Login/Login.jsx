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
  CSM: {
    login: '/Hospital/CSM/CSMAuth/CSM_login',
    me: '/Hospital/CSM/CSMAuth/auth_me',
    redirect: '/csm/dashboard',
  },
  Pharmacist: {
    login: '/Hospital/Pharmacist/PharmacistAuth/pharmacist_login',
    me: '/Hospital/Pharmacist/PharmacistAuth/auth_me',
    redirect: '/pharmacy',
  },
  LaboratoryTechnician: {
    login: '/mlt/MLTAuth/mlt_login',
    me: '/mlt/MLTAuth/auth_me',
    redirect: '/mlt/dashboard',
  },
  Radiographer: {
    login: '/radiographer/RadiographerAuth/radiographer_login',
    me: '/radiographer/RadiographerAuth/auth_me',
    redirect: '/radiology/radiographer',
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
      await API.post(config.login, { username, password });
      const meRes = await API.get(config.me);
      const userData = meRes.data;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', selectedRole);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <i className="bi bi-hospital text-white text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Bishoftu General</h1>
            <p className="text-gray-500 text-sm mt-1.5">Secure role-based access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <i className="bi bi-person text-lg"></i>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl 
                             focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 
                             outline-none transition bg-gray-50/50 hover:bg-white"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <i className="bi bi-lock text-lg"></i>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl 
                             focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 
                             outline-none transition bg-gray-50/50 hover:bg-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select your role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <i className="bi bi-person-badge text-lg"></i>
                </span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full appearance-none pl-11 pr-10 py-3 border border-gray-200 rounded-xl 
                             focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 
                             outline-none transition bg-gray-50/50 hover:bg-white cursor-pointer"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Nurse">Nurse</option>
                  <option value="CSM">CSM (Central Store Manager)</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="LaboratoryTechnician">Laboratory Technician</option>
                  <option value="Radiographer">Radiographer</option>
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400">
                  <i className="bi bi-chevron-down"></i>
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                <i className="bi bi-exclamation-circle-fill text-base"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 
                         hover:from-indigo-700 hover:to-purple-700 text-white font-semibold 
                         rounded-xl shadow-md hover:shadow-lg transition-all duration-300 
                         flex items-center justify-center gap-2
                         disabled:opacity-60 disabled:cursor-not-allowed
                         active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right text-lg"></i>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-7">
            Use real credentials for your role
          </p>
        </div>
      </div>
    </div>
  );
}