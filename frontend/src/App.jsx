// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from './Pages/auth/AdminLogin';
import Dashboard from './Pages/Admin/Dashboard';
import SideN from "./Pages/side";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/side" element={<SideN/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;