import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const CSMDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* ========== SIDEBAR ========== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          flex flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600">🏢 CSM</span>
          {/* Close button - Tailwind only */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200"
          >
            <i className="bi bi-x-lg"></i> {/* Bootstrap Icon */}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/csm/pharmacy-info"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <i className="bi bi-clipboard-data mr-3 text-lg"></i> {/* Bootstrap Icon */}
            Pharmacy Info
          </NavLink>

          <NavLink
            to="/csm/inventory"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <i className="bi bi-box-seam mr-3 text-lg"></i> {/* Bootstrap Icon */}
            Inventory
          </NavLink>

          <NavLink
            to="/csm/add-inventory"
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <i className="bi bi-plus-circle mr-3 text-lg"></i> {/* Bootstrap Icon */}
            Add Medicine
          </NavLink>
        </nav>

        {/* Sidebar Footer - Logout (Tailwind only) */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {/* handle logout */}}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 border border-red-200"
          >
            <i className="bi bi-box-arrow-right"></i> {/* Bootstrap Icon */}
            Logout
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header with toggle button and user info */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3">
            {/* Hamburger toggle button - Tailwind only */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 lg:hidden"
            >
              <i className="bi bi-list text-xl"></i> {/* Bootstrap Icon */}
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              CSM Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Welcome, {user?.fullName || 'CSM'}
            </span>
            {/* Avatar - Tailwind only */}
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-medium">
              {user?.fullName?.charAt(0) || 'C'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-md p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CSMDashboard;