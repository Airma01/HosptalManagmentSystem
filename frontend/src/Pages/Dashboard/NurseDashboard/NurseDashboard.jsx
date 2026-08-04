import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const NurseDashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Nurse Dashboard</h2>

      <nav className="flex space-x-4 border-b border-gray-200 mb-6 flex-wrap">
        <NavLink
          to="/nurse/triage"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 transition ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }
        >
          Triage Records
        </NavLink>
        <NavLink
          to="/nurse/create-triage"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 transition ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }
        >
          + Create Triage
        </NavLink>
        <NavLink
          to="/nurse/assign-department"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 transition ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }
        >
          Assign Department
        </NavLink>
        <NavLink
          to="/nurse/recent-visits"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 transition ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }
        >
          Recent Visits
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
};

export default NurseDashboard;