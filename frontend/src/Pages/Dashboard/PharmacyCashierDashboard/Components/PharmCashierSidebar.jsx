import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import pharmacyCashierApi from "../Services/pharmacyCashierApi";

const PharmCashierSidebar = ({ sidebarOpen, setSidebarOpen, userName }) => {
  const navigate = useNavigate();
  const navLinks = [
    { to: "/pharmacy-cashier/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { to: "/pharmacy-cashier/unpaid-prescriptions", icon: "bi-prescription2", label: "Unpaid Prescriptions" },
    { to: "/pharmacy-cashier/today-collection", icon: "bi-cash-stack", label: "Today Collection" },
  ];
  const handleLogout = async () => {
    try { await pharmacyCashierApi.logout(); } catch (_) {}
    localStorage.removeItem("user"); localStorage.removeItem("role");
    navigate("/login");
  };
  return (
    <>
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold text-emerald-600"><i className="bi bi-capsule mr-2"></i>Pharm Cashier</h2>
            <p className="text-xs text-gray-500">All Branches</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? "bg-emerald-50 text-emerald-600" : "text-gray-700 hover:bg-gray-100"}`}>
                <i className={`bi ${l.icon} mr-3`}></i>{l.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
              <i className="bi bi-box-arrow-right mr-3"></i>Logout
            </button>
            <div className="mt-2 text-xs text-gray-400 text-center truncate">{userName}</div>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </>
  );
};
export default PharmCashierSidebar;
