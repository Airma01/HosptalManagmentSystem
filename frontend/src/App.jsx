// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from './Pages/auth/AdminLogin';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import AddUser from "./Pages/Admin/AddUser";
import AdminAuthRouter from "./ProtectRoute/AdminAuthRouter";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* <AdminAuthRouter>
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        </AdminAuthRouter> */}
        <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard/users/add" element={<AddUser/>} />
      </Routes>
    </Router>
  );
}

export default App;