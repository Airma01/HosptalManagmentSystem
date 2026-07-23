// src/Pages/Admin/AdminNav.jsx

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../../Config/API";

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const getCurrentSection = () => {
    const path = location.pathname;

    if (path === "/admin/dashboard") return "dashboard";

    const segments = path.split("/");
    return segments[segments.length - 1] || "dashboard";
  };

  const currentSection = getCurrentSection();

  const handleLogout = async () => {
    try {
      await API.post("/Hospital/Admin_auth/logout");

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const NavItem = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "bi-grid-1x2-fill",
      id: "dashboard",
    },
    {
      name: "User Management",
      path: "/admin/dashboard/users",
      icon: "bi-people-fill",
      id: "users",
    },
    {
      name: "Departments",
      path: "/admin/dashboard/departments",
      icon: "bi-building-fill",
      id: "departments",
    },
    {
      name: "Doctors",
      path: "/admin/dashboard/doctors",
      icon: "bi-person-badge-fill",
      id: "doctors",
    },
    {
      name: "Nurses",
      path: "/admin/dashboard/nurses",
      icon: "bi-heart-pulse-fill",
      id: "nurses",
    },
    {
      name: "Medicine",
      path: "/admin/dashboard/medicine",
      icon: "bi-prescription",
      id: "medicine",
    },
    {
      name: "Inventory",
      path: "/admin/dashboard/inventory",
      icon: "bi-box-seam-fill",
      id: "inventory",
    },
    {
      name: "Pharmacy",
      path: "/admin/dashboard/pharmacy",
      icon: "bi-capsule-fill",
      id: "pharmacy",
    },
    {
      name: "Admins",
      path: "/admin/dashboard/admins",
      icon: "bi-shield-lock-fill",
      id: "admins",
    },
    {
      name: "Settings",
      path: "/admin/dashboard/settings",
      icon: "bi-gear-fill",
      id: "settings",
    },
  ];

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-white shadow-lg transition-all duration-300 flex flex-col h-screen sticky top-0`}
    >
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isCollapsed ? (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        ) : (
          <i className="bi bi-grid-1x2-fill text-2xl text-blue-600"></i>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <i
            className={`bi ${
              isCollapsed ? "bi-chevron-right" : "bi-chevron-left"
            } text-xl`}
          ></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {NavItem.map((item) => {
          const isActive = currentSection === item.id;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <i className={`bi ${item.icon} text-lg`}></i>

              {!isCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
        >
          <i className="bi bi-box-arrow-right text-lg"></i>

          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminNav;