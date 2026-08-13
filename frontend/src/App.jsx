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
  AddTriagePage,
  RecentTriageByDepartment
} from './pages/Dashboard/NurseDashboard';
import NurseProtectRoute from "./ProtectRoute/NurseProtectRoute";
import ReceptionistProtectRouter from "./ProtectRoute/ReceptionistProtectRouter";
import { 
  DoctorDashboard, 
  ConsultationList, 
  CreateConsultation, 
  UpdateConsultation, 
  CreateMedicalRecord,
  TriageByVisit,
  PatientDetail
} from './pages/Dashboard/DoctorDashboard';
import CSMProtectRoute from './ProtectRoute/CSMProtectRoute';

// CSM Dashboard imports (barrel)
import {
  CSMDashboard,
  PharmacyInfo,
  InventoryList,
  AddInventory,
  UpdateInventory,
  LowStockMedicines,
  ExpiredMedicines,
  MedicineList,
  AddMedicine,
  MedicineDetails,
  EditMedicine,
  PendingRequests,
  RequestDetails,
  TransferList,
  CreateTransfer,
  TransferDetails,
  StockReport,
  TransferReport,
  RequestReport
} from './Pages/Dashboard/CSMDashboard';

// ===== Pharmacy Dashboard Imports (aliased) =====
import PharmacistProtectRoute from './ProtectRoute/PharmacistProtectRoute';
import PharmacistDashboardLayout from './Pages/Dashboard/PharmacyDashboard/PharmacistDashboardLayout';
import PharmacyDashboard from './Pages/Dashboard/PharmacyDashboard/Dashboard';

// Inventory
import PharmacyInventory from './Pages/Dashboard/PharmacyDashboard/Inventory/Inventory';
import PharmacyMedicineStock from './Pages/Dashboard/PharmacyDashboard/Inventory/MedicineStock';
import PharmacyLowStockMedicines from './Pages/Dashboard/PharmacyDashboard/Inventory/LowStockMedicines';
import PharmacyExpiredMedicines from './Pages/Dashboard/PharmacyDashboard/Inventory/ExpiredMedicines';
import PharmacyNearExpiryMedicines from './Pages/Dashboard/PharmacyDashboard/Inventory/NearExpiryMedicines';

// Requests
import PharmacyCreateRequest from './Pages/Dashboard/PharmacyDashboard/Requests/CreateRequest';
import PharmacyMyRequests from './Pages/Dashboard/PharmacyDashboard/Requests/MyRequests';
import PharmacyRequestDetails from './Pages/Dashboard/PharmacyDashboard/Requests/RequestDetails';

// Transfers
import PharmacyReceivedTransfers from './Pages/Dashboard/PharmacyDashboard/Transfers/ReceivedTransfers';
import PharmacyTransferDetails from './Pages/Dashboard/PharmacyDashboard/Transfers/TransferDetails';

// Prescriptions
import PharmacyPendingPrescriptions from './Pages/Dashboard/PharmacyDashboard/Prescriptions/PendingPrescriptions';
import PharmacyPrescriptionDetails from './Pages/Dashboard/PharmacyDashboard/Prescriptions/PrescriptionDetails';
import PharmacyMedicineAvailability from './Pages/Dashboard/PharmacyDashboard/Prescriptions/MedicineAvailability';

// Dispensing
import PharmacyDispenseMedicine from './Pages/Dashboard/PharmacyDashboard/Dispensing/DispenseMedicine';
import PharmacyDispenseHistory from './Pages/Dashboard/PharmacyDashboard/Dispensing/DispenseHistory';
import PharmacyDispenseDetails from './Pages/Dashboard/PharmacyDashboard/Dispensing/DispenseDetails';

// Reports
import PharmacyStockReport from './Pages/Dashboard/PharmacyDashboard/Reports/StockReport';
import PharmacyRequestReport from './Pages/Dashboard/PharmacyDashboard/Reports/RequestReport';
import PharmacyTransferReport from './Pages/Dashboard/PharmacyDashboard/Reports/TransferReport';
import PharmacyDispenseReport from './Pages/Dashboard/PharmacyDashboard/Reports/DispenseReport';
import PharmacyExpiryReport from './Pages/Dashboard/PharmacyDashboard/Reports/ExpiryReport';

// Profile
import PharmacyProfile from './Pages/Dashboard/PharmacyDashboard/Profile/Profile';
import PharmacyChangePassword from './Pages/Dashboard/PharmacyDashboard/Profile/ChangePassword';

import DepartmentTriageList from "./Pages/Dashboard/DoctorDashboard/DepartmentTriageList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="Bishoftu/login" element={<Login />} />

        <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/users/add" element={<AddUser />} />

        {/* Nurse routes */}
        <Route element={<NurseProtectRoute />}>
          <Route path="/nurse" element={<NurseDashboard />}>
            <Route index element={<Navigate to="triage" replace />} />
            <Route path="triage" element={<TriageList />} />
            <Route path="create-triage" element={<CreateTriage />} />
            <Route path="assign-department" element={<AssignDepartment />} />
            <Route path="recent-visits" element={<RecentVisits />} />
            <Route path="recent-visits/:id" element={<AddTriagePage />} />
            <Route path="recent-triage-department" element={<RecentTriageByDepartment />} />
          </Route>
        </Route>

        {/* Receptionist routes */}
        <Route element={<ReceptionistProtectRouter />}>
          <Route path="/receptionist" element={<ReceptionistDashboard />}>
            <Route index element={<Navigate to="patients" replace />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="visits" element={<VisitList />} />
            <Route path="create-visit" element={<CreateVisit />} />
            <Route path="create-patient" element={<CreatePatient />} />
          </Route>
        </Route>

        {/* Doctor routes */}
        <Route path="/doctor" element={<DoctorDashboard />}>
          <Route index element={<Navigate to="consultations" replace />} />
          <Route path="consultations" element={<ConsultationList />} />
          <Route path="create-consultation" element={<CreateConsultation />} />
          <Route path="update-consultation/:id" element={<UpdateConsultation />} />
          <Route path="create-medical-record" element={<CreateMedicalRecord />} />
          <Route path="triage" element={<TriageByVisit />} />
          <Route path="triage/:visitId" element={<TriageByVisit />} />
          <Route path="department-triage" element={<DepartmentTriageList />} />
          <Route path="patient/:patientId" element={<PatientDetail />} />
        </Route>

        {/* CSM routes */}
        <Route element={<CSMProtectRoute />}>
          <Route path="/csm" element={<CSMDashboard />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PharmacyInfo />} />
            <Route path="medicines" element={<MedicineList />} />
            <Route path="medicines/add" element={<AddMedicine />} />
            <Route path="medicines/:id" element={<MedicineDetails />} />
            <Route path="medicines/edit/:id" element={<EditMedicine />} />
            <Route path="inventory" element={<InventoryList />} />
            <Route path="inventory/add" element={<AddInventory />} />
            <Route path="inventory/update/:id" element={<UpdateInventory />} />
            <Route path="inventory/low-stock" element={<LowStockMedicines />} />
            <Route path="inventory/expired" element={<ExpiredMedicines />} />
            <Route path="requests" element={<PendingRequests />} />
            <Route path="requests/:id" element={<RequestDetails />} />
            <Route path="transfers" element={<TransferList />} />
            <Route path="transfers/create" element={<CreateTransfer />} />
            <Route path="transfers/:id" element={<TransferDetails />} />
            <Route path="reports/stock" element={<StockReport />} />
            <Route path="reports/transfers" element={<TransferReport />} />
            <Route path="reports/requests" element={<RequestReport />} />
          </Route>
        </Route>

        {/* ===== Pharmacist routes – base path: /pharmacy ===== */}
        <Route element={<PharmacistProtectRoute />}>
          <Route path="/pharmacy" element={<PharmacistDashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<PharmacyDashboard />} />

            {/* Inventory */}
            <Route path="inventory" element={<PharmacyInventory />} />
            <Route path="inventory/stock/:medicineId" element={<PharmacyMedicineStock />} />
            <Route path="inventory/low-stock" element={<PharmacyLowStockMedicines />} />
            <Route path="inventory/expired" element={<PharmacyExpiredMedicines />} />
            <Route path="inventory/near-expiry" element={<PharmacyNearExpiryMedicines />} />

            {/* Requests */}
            <Route path="requests" element={<PharmacyMyRequests />} />
            <Route path="requests/new" element={<PharmacyCreateRequest />} />
            <Route path="requests/:id" element={<PharmacyRequestDetails />} />

            {/* Transfers */}
            <Route path="transfers" element={<PharmacyReceivedTransfers />} />
            <Route path="transfers/:id" element={<PharmacyTransferDetails />} />

            {/* Prescriptions */}
            <Route path="prescriptions" element={<PharmacyPendingPrescriptions />} />
            <Route path="prescriptions/:id" element={<PharmacyPrescriptionDetails />} />
            <Route path="prescriptions/:id/availability" element={<PharmacyMedicineAvailability />} />

            {/* Dispensing */}
            <Route path="dispense" element={<PharmacyDispenseHistory />} />
            <Route path="dispense/new/:id" element={<PharmacyDispenseMedicine />} />
            <Route path="dispense/:id" element={<PharmacyDispenseDetails />} />
            <Route path="dispense/history" element={<PharmacyDispenseHistory />} />

            {/* Reports */}
            <Route path="reports/stock" element={<PharmacyStockReport />} />
            <Route path="reports/requests" element={<PharmacyRequestReport />} />
            <Route path="reports/transfers" element={<PharmacyTransferReport />} />
            <Route path="reports/dispense" element={<PharmacyDispenseReport />} />
            <Route path="reports/expiry" element={<PharmacyExpiryReport />} />

            {/* Profile */}
            <Route path="profile" element={<PharmacyProfile />} />
            <Route path="profile/change-password" element={<PharmacyChangePassword />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;