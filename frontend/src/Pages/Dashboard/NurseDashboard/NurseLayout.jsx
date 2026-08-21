import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import API from '../../../Config/API';

const NurseLayout = () => {
  const [nurse, setNurse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNurse = async () => {
      try {
        const res = await API.get('/Hospital/nurse/NurseAuth/auth_me');
        setNurse(res.data);
      } catch {
        setNurse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNurse();
  }, []);

  const handleLogout = async () => {
    // Clear cookie by calling logout endpoint (if exists) or just redirect
    // For now, we'll redirect to login
    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/Bishoftu/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const fullName = nurse?.fullName || 'Nurse';

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Nurse Panel</h1>
          <p className="text-sm text-gray-600">Welcome, {fullName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/nurse/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
              }`
            }
          >
            <span className="mr-3">📊</span> Dashboard
          </NavLink>
          <NavLink
            to="/nurse/patients"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
              }`
            }
          >
            <span className="mr-3">👤</span> Patients
          </NavLink>
          <NavLink
            to="/nurse/patients/register"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
              }`
            }
          >
            <span className="mr-3">➕</span> Register Patient
          </NavLink>
          {/* <NavLink
            to="/nurse/visits/today"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
              }`
            }
          >
            <span className="mr-3">📋</span> Today's Visits
          </NavLink> */}
         
          
          {/* <NavLink
            to="/nurse/triage/pending"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
              }`
            }
          >
            <span className="mr-3">⏳</span> Pending Triage
          </NavLink> */}
         
          {/* <NavLink
            to="/nurse/prescriptions/create"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
              }`
            }
          >
            <span className="mr-3">💊</span> New Prescription
          </NavLink> */}
          <NavLink
            to="/nurse/laboratory/request"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-50'
              }`
            }
          >
            <span className="mr-3">🔬</span> Request Lab Test
          </NavLink>
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <span className="mr-2">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default NurseLayout;