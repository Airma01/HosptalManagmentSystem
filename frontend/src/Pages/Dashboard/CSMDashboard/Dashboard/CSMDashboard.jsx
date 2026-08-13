import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const CSMDashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex-shrink-0 hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <h5 className="text-xl font-bold text-indigo-600 text-center">🏢 CSM</h5>
        </div>
        <nav className="p-4 space-y-1">
          <NavLink
            to="/csm/dashboard"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <i className="bi bi-grid-1x2-fill mr-2"></i> Dashboard
          </NavLink>
          <NavLink
            to="/csm/medicines"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <i className="bi bi-capsule mr-2"></i> Medicines
          </NavLink>
          <NavLink
            to="/csm/inventory"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <i className="bi bi-box-seam mr-2"></i> Inventory
          </NavLink>
          <NavLink
            to="/csm/requests"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <i className="bi bi-clipboard-check mr-2"></i> Requests
          </NavLink>
          <NavLink
            to="/csm/transfers"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <i className="bi bi-truck mr-2"></i> Transfers
          </NavLink>
          <NavLink
            to="/csm/reports/stock"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <i className="bi bi-file-earmark-bar-graph mr-2"></i> Reports
          </NavLink>
          <button
            className="w-full mt-6 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            <i className="bi bi-box-arrow-right mr-2"></i> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CSMDashboard;