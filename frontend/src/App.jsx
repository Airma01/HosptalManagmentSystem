import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from './Pages/auth/AdminLogin';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import AddUser from "./Pages/Admin/AddUser";
import Login from "./Pages/Login/Login";
import ReceptionistDashboard from './Pages/Dashboard/ReceptionistDashboard/ReceptionistDashboard';
import PatientList from './Pages/Dashboard/ReceptionistDashboard/PatientList';
import VisitList from './Pages/Dashboard/ReceptionistDashboard/VisitList';
import CreateVisit from './Pages/Dashboard/ReceptionistDashboard/CreateVisit';
import CreatePatient from './Pages/Dashboard/ReceptionistDashboard/CreatePatient';
import { 
  NurseDashboard, 
  TriageList, 
  CreateTriage, 
  AssignDepartment,
  RecentVisits,                    
  AddTriagePage
} from './pages/Dashboard/NurseDashboard';
import NurseProtectRoute from "./ProtectRoute/NurseProtectRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="Bishoftu/login" element={<Login />} />

        <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/users/add" element={<AddUser />} />

        {/* Nurse routes – protected by NurseProtectRoute */}
        <Route element={<NurseProtectRoute />}>
          <Route path="/nurse" element={<NurseDashboard />}>
            <Route index element={<Navigate to="triage" replace />} />
            <Route path="triage" element={<TriageList />} />
            <Route path="create-triage" element={<CreateTriage />} />
            <Route path="assign-department" element={<AssignDepartment />} />
            <Route path="recent-visits" element={<RecentVisits />} />
            <Route path="recent-visits/:id" element={<AddTriagePage />} />
          </Route>
        </Route>

        {/* Receptionist nested routes */}
        <Route path="/receptionist" element={<ReceptionistDashboard />}>
          <Route index element={<Navigate to="patients" replace />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="visits" element={<VisitList />} />
          <Route path="create-visit" element={<CreateVisit />} />
          <Route path="create-patient" element={<CreatePatient />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;