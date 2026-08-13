import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { getAuthenticatedUser } from '../../../utils/getAuthenticatedUser';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoctor = async () => {
      const user = await getAuthenticatedUser();
      if (user) {
        setDoctor(user);
      }
      setLoading(false);
    };
    loadDoctor();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="p-6">
      {/* Header with Doctor Info */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              👋 Welcome, {doctor?.fullName || 'Doctor'}
            </h1>
            <p className="text-indigo-100 mt-1">
              {doctor?.role} • Department: {doctor?.departmentName || doctor?.departmentID || 'N/A'}
              {doctor?.departmentName && doctor?.departmentID && (
                <span className="ml-2 text-xs opacity-75">(ID: {doctor.departmentID})</span>
              )}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <span className="text-sm font-medium">Doctor ID: {doctor?.doctorID || doctor?.UserID || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs with Bootstrap Icons */}
      <nav className="flex flex-wrap gap-2 border-b border-gray-200 mb-6 pb-2">
        <NavLink
          to="/doctor/consultations"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
              isActive
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <i className="bi bi-clipboard2-pulse"></i>
          Consultations
        </NavLink>

        <NavLink
          to="/doctor/create-medical-record"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
              isActive
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <i className="bi bi-file-earmark-medical"></i>
          Medical Record
        </NavLink>

        <NavLink
          to="/doctor/triage"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
              isActive
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <i className="bi bi-search-heart"></i>
          View Triage
        </NavLink>

        <NavLink
          to="/doctor/department-triage"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-t-lg transition flex items-center gap-2 ${
              isActive
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          <i className="bi bi-building"></i>
          Department Triage
        </NavLink>
      </nav>

      {/* Page Content */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default DoctorDashboard;