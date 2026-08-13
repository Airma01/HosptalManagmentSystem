import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

const PharmacistDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(userData.fullName || "Pharmacist");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/Bishoftu/login");
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ✅ All navigation links updated to /pharmacy/...
  const navLinks = [
    { to: "/pharmacy/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/pharmacy/inventory", icon: "bi-box", label: "Inventory" },
    { to: "/pharmacy/requests", icon: "bi-file-earmark-text", label: "Requests" },
    { to: "/pharmacy/transfers", icon: "bi-truck", label: "Transfers" },
    { to: "/pharmacy/prescriptions", icon: "bi-prescription2", label: "Prescriptions" },
    { to: "/pharmacy/dispense", icon: "bi-clock-history", label: "Dispensing" },
    { to: "/pharmacy/reports/stock", icon: "bi-file-earmark-bar-graph", label: "Reports" },
    { to: "/pharmacy/profile", icon: "bi-person", label: "Profile" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ===== Sidebar ===== */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-blue-600">MediCare Pharmacy</h2>
            <p className="text-xs text-gray-500">Pharmacist Panel</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <i className={`bi ${link.icon} mr-3`}></i>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer - Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <i className="bi bi-box-arrow-right mr-3"></i>
              Logout
            </button>
            <div className="mt-2 text-xs text-gray-400 text-center">
              {userName}
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Overlay for mobile ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* ===== Main Content ===== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header Bar */}
        <header className="bg-white border-b shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 md:hidden"
            >
              <i className="bi bi-list text-xl"></i>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Pharmacy Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {userName}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboardLayout;