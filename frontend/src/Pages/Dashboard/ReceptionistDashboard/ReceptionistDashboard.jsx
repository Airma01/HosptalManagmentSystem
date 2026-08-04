import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const ReceptionistDashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Receptionist Dashboard</h2>
      <div className="mb-6 text-gray-600 text-sm italic ">
        Welcome to your receptionist dashboard!
        <div className="text-lg font-semibold">Today's Visits: 29</div>
      </div>
      {/* Navigation Tabs */}
      <nav className="flex space-x-4 border-b border-gray-200 mb-6">
        <NavLink
          to="/receptionist/patients"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 transition ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }
        >
          Patients
        </NavLink>
        <NavLink
          to="/receptionist/visits"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 transition ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }
        >
          Visits
        </NavLink>
        <NavLink
          to="/receptionist/create-visit"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 transition ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }
        >
          + Create Visit
        </NavLink>
        <NavLink
          to="/receptionist/create-patient"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 transition ${
              isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }
        >
          + Create Patient
        </NavLink>
      </nav>
      
      {/* Render nested route component */}
      <Outlet />
    </div>
  );
};

export default ReceptionistDashboard;