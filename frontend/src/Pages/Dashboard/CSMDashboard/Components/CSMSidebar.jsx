import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const CSMSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const navItems = [
    { to: "/csm/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { to: "/csm/medicine", label: "Medicines", icon: "bi-capsule" },
    { to: "/csm/inventory", label: "Inventory", icon: "bi-box-seam" },
    { to: "/csm/request", label: "Requests", icon: "bi-file-text" },
    { to: "/csm/transfer", label: "Transfers", icon: "bi-truck" },
    { to: "/csm/branch", label: "Branches", icon: "bi-building" },
    { to: "/csm/monitoring", label: "Monitoring", icon: "bi-graph-up" },
    { to: "/csm/report", label: "Reports", icon: "bi-bar-chart" },
  ];

  return (
    <aside
      className={`bg-gray-900 text-white h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <span className="font-bold text-lg">CSM Panel</span>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white focus:outline-none"
        >
          <i className={`bi ${collapsed ? "bi-list" : "bi-chevron-left"}`}></i>
        </button>
      </div>

      <nav className="mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 hover:bg-gray-800 transition ${
                isActive ? "bg-gray-800 border-r-4 border-blue-500" : ""
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <i className={`bi ${item.icon} text-lg`}></i>
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full border-t border-gray-700 p-4">
        <div className="flex items-center">
          <i className="bi bi-person-circle text-xl"></i>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">CSM User</p>
              <p className="text-xs text-gray-400">Central Store Manager</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CSMSidebar;