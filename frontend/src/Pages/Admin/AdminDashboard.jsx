import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminNav from "./AdminNav";
import DashboardOverview from "./DashboardOverview";
import UserManagement from "./UserManagement";
import Departments from "./Departments";
import Doctors from "./Doctors";
import Nurses from "./Nurses";
import Medicine from "./Medicine";
import Inventory from "./Inventory";
import Pharmacy from "./Pharmacy";
import Admins from "./Admins";
import Settings from "./Settings";
import AdminAuthRouter from "../../ProtectRoute/AdminAuthRouter";
import UserAction from "./UserAction";
import DepartmentDetail from "./DepartmentDetail";
import PharmacyDetail from "./PharmacyDetail"; // NEW
import CentralPharmacy from './CentralPharmacy/CentralPharmacy';
import CentralPharmacyDetail from './CentralPharmacy/CentralPharmacyDetail';
import BranchPharmacy from './BranchPharmacy/BranchPharmacy';
import BranchPharmacyDetail from './BranchPharmacy/BranchPharmacyDetail';
const AdminDashboard = () => {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminNav />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back, Admin</h2>
            <p className="text-gray-600 text-sm">Manage your hospital system efficiently</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors relative">
              <i className="bi bi-bell text-xl"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <i className="bi bi-person-circle text-2xl"></i>
            </button>
          </div>
        </div>

        <Routes>
          <Route element={<AdminAuthRouter />}>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="departments" element={<Departments />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="nurses" element={<Nurses />} />
            <Route path="medicine" element={<Medicine />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="central-pharmacy" element={<CentralPharmacy />} />
<Route path="central-pharmacy/:id" element={<CentralPharmacyDetail />} />
<Route path="branch-pharmacy" element={<BranchPharmacy />} />
<Route path="branch-pharmacy/:id" element={<BranchPharmacyDetail />} />
            <Route path="pharmacy" element={<Pharmacy />} />
            <Route path="pharmacy/:type/:id" element={<PharmacyDetail />} /> {/* NEW */}
            <Route path="admins" element={<Admins />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users/:id" element={<UserAction />} />
            <Route path="departments/:id" element={<DepartmentDetail />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;