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

import NurseProtectRoute from "./ProtectRoute/NurseProtectRoute";
import ReceptionistProtectRouter from "./ProtectRoute/ReceptionistProtectRouter";
import {
  DoctorLayout,
  DoctorDashboard,
  ConsultationQueue,
  ConsultationPatient,
  AdultMedicalCareQueue,
  AdultMedicalCarePatient,
  MaternalChildQueue,
  MaternalChildDashboard,
  PregnancyList,
  PregnancyRegistration,
  PregnancyDetails,
  ANCQueue,
  ANCVisitDetails,
  RiskAssessment,
  HighRiskPregnancy,
  BirthPreparedness,
  PregnancyLaboratoryOrder,
  PregnancyUltrasound,
  PregnancyMedication,
  LaborRecord,
  DeliveryRecord,
  DeliveryComplication,
  ChildBirth,
  PNCVisit,
  FamilyPlanning,
  ChildHealthDashboard,
  ReferralQueue,
  ReferralDetails,
  CreateReferral,
} from "./Pages/Dashboard/DoctorDashboard";
import CSMProtectRoute from './ProtectRoute/CSMProtectRoute';

// ===== CSM Imports =====
import {
  CSMDashboard,
  MedicineList,
  CreateMedicine,
  EditMedicine,
  MedicineDetails,
  MedicineSearch,
  InventoryList,
  InventoryDetails,
  CreateInventory,
  EditInventory,
  AdjustStock,
  InventoryHistory,
  LowStock,
  ExpiringMedicines,
  ExpiredMedicines,
  InventoryValue,
  ReceivePurchasedMedicine,
  ReceiveAidStoreTransfer,
  RequestList,
  RequestDetails,
  RequestReview,
  ApproveRequest,
  PartialApproveRequest,
  RejectRequest,
  CancelRequest,
  RequestAvailability,
  TransferList,
  CreateTransfer,
  TransferDetails,
  DispatchTransfer,
  TransferTracking,
  UpdateTransferStatus,
  CancelTransfer,
  TransferHistory,
  BranchList,
  BranchDetails,
  BranchInventory,
  BranchRequests,
  BranchTransfers,
  BranchConsumption,
  BranchLowStock,
  LowStockMonitoring,
  ExpiryMonitoring,
  ExpiredMedicinesMonitor,
  NearExpiryMedicines,
  CriticalStock,
  ReplenishmentSuggestions,
  MedicineMovement,
  InventoryAudit,
  InventoryReport,
  BranchInventoryReport,
  RequestReport,
  TransferReport,
  ExpiryReport,
  ConsumptionReport,
  InventoryValueReport,
  StockMovementReport,
} from "./Pages/Dashboard/CSMDashboard";

// ===== CSM Layout =====
import CSMLayout from "./Pages/Dashboard/CSMDashboard/CSMLayout";

// ===== Pharmacy Dashboard Imports =====
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


// ===== NEW NURSE DASHBOARD IMPORTS =====
import NurseDashboard from './Pages/Dashboard/NurseDashboard/NurseDashboard';
import PatientListNurse from './Pages/Dashboard/NurseDashboard/PatientManagement/PatientList';
import PatientDetailNurse from './Pages/Dashboard/NurseDashboard/PatientManagement/PatientDetail';
import RegisterPatientNurse from './Pages/Dashboard/NurseDashboard/PatientManagement/RegisterPatient';
import TodayVisitsNurse from './Pages/Dashboard/NurseDashboard/VisitManagement/TodayVisits';
import CreateVisitNurse from './Pages/Dashboard/NurseDashboard/VisitManagement/CreateVisit';
import CreateVisitAndTriageNurse from './Pages/Dashboard/NurseDashboard/VisitManagement/CreateVisitAndTriage';
import VisitDetailNurse from './Pages/Dashboard/NurseDashboard/VisitManagement/VisitDetail';
import PendingTriageNurse from './Pages/Dashboard/NurseDashboard/TriageManagement/PendingTriage';
import CreateTriageNurse from './Pages/Dashboard/NurseDashboard/TriageManagement/CreateTriage';
import TriageDetailNurse from './Pages/Dashboard/NurseDashboard/TriageManagement/TriageDetail';
import CreatePrescriptionNurse from './Pages/Dashboard/NurseDashboard/PrescriptionManagement/CreatePrescription';
import PrescriptionDetailNurse from './Pages/Dashboard/NurseDashboard/PrescriptionManagement/PrescriptionDetail';
import RequestLabTestNurse from './Pages/Dashboard/NurseDashboard/LaboratoryManagement/RequestLabTest';
import LabTestDetailNurse from './Pages/Dashboard/NurseDashboard/LaboratoryManagement/LabTestDetail';
import NurseLayout from './Pages/Dashboard/NurseDashboard/NurseLayout';

import MLTDashboard from './Pages/Dashboard/MLTDashboard/MLTDashboard';
import MLTPatient from './Pages/Dashboard/MLTDashboard/MLTPatient';
import MLTQueue from './Pages/Dashboard/MLTDashboard/MLTQueue';
import MLTTest from './Pages/Dashboard/MLTDashboard/MLTTest';
import MLTResult from './Pages/Dashboard/MLTDashboard/MLTResult';
import MLTReport from './Pages/Dashboard/MLTDashboard/MLTReport';
import LaboratorySection from './Pages/Dashboard/MLTDashboard/LaboratorySection/LaboratorySection';
import AddSection from './Pages/Dashboard/MLTDashboard/LaboratorySection/AddSection';
import SectionDetails from './Pages/Dashboard/MLTDashboard/LaboratorySection/SectionDetails';
import AddTestType from './Pages/Dashboard/MLTDashboard/LaboratorySection/AddTestType';
// ===== Radiology Dashboard =====
import RadiologyLayout from './Pages/Dashboard/RadiologyDashboard/RadiologyLayout';
import RadiologyDashboard from './Pages/Dashboard/RadiologyDashboard/RadiologyDashboard';
import RadiographerDashboard from './Pages/Dashboard/RadiologyDashboard/Radiographer/RadiographerDashboard';
import RadiographerQueue from './Pages/Dashboard/RadiologyDashboard/Radiographer/RadiographerQueue';
import RadiographerRequestDetails from './Pages/Dashboard/RadiologyDashboard/Radiographer/RadiographerRequestDetails';
import PerformExamination from './Pages/Dashboard/RadiologyDashboard/Radiographer/PerformExamination';
import UploadRadiologyImage from './Pages/Dashboard/RadiologyDashboard/Radiographer/UploadRadiologyImage';
import CompletedExaminations from './Pages/Dashboard/RadiologyDashboard/Radiographer/CompletedExaminations';
import RadiologistDashboard from './Pages/Dashboard/RadiologyDashboard/Radiologist/RadiologistDashboard';
import RadiologistQueue from './Pages/Dashboard/RadiologyDashboard/Radiologist/RadiologistQueue';
import RadiologistRequestDetails from './Pages/Dashboard/RadiologyDashboard/Radiologist/RadiologistRequestDetails';
import RadiologyResultWorkup from './Pages/Dashboard/RadiologyDashboard/Radiologist/RadiologyResultWorkup';
import CompletedReports from './Pages/Dashboard/RadiologyDashboard/Radiologist/CompletedReports';
import RadiologyDepartmentList from './Pages/Dashboard/RadiologyDashboard/Department/RadiologyDepartmentList';
import CreateRadiologyDepartment from './Pages/Dashboard/RadiologyDashboard/Department/CreateRadiologyDepartment';
import UpdateRadiologyDepartment from './Pages/Dashboard/RadiologyDashboard/Department/UpdateRadiologyDepartment';
import RadiologyDepartmentDetails from './Pages/Dashboard/RadiologyDashboard/Department/RadiologyDepartmentDetails';
import RadiologyTestTypeList from './Pages/Dashboard/RadiologyDashboard/TestType/RadiologyTestTypeList';
import CreateRadiologyTestType from './Pages/Dashboard/RadiologyDashboard/TestType/CreateRadiologyTestType';
import UpdateRadiologyTestType from './Pages/Dashboard/RadiologyDashboard/TestType/UpdateRadiologyTestType';
import RadiologyRequestList from './Pages/Dashboard/RadiologyDashboard/Request/RadiologyRequestList';
import CreateRadiologyRequest from './Pages/Dashboard/RadiologyDashboard/Request/CreateRadiologyRequest';
import RadiologyRequestDetails from './Pages/Dashboard/RadiologyDashboard/Request/RadiologyRequestDetails';
import UpdateRadiologyRequest from './Pages/Dashboard/RadiologyDashboard/Request/UpdateRadiologyRequest';
import RadiologyResultDetails from './Pages/Dashboard/RadiologyDashboard/Result/RadiologyResultDetails';
import Appointments from "./Pages/Dashboard/DoctorDashboard/Appointments/Appointments";

// ─── ⚠️ PLACEHOLDER COMPONENTS FOR MISSING NURSE ROUTES ───
const AssignDepartment = () => (
  <div className="p-4 text-gray-600">Assign Department – Coming Soon</div>
);

const AddTriagePage = () => (
  <div className="p-4 text-gray-600">Add Triage – Coming Soon</div>
);

const RecentTriageByDepartment = () => (
  <div className="p-4 text-gray-600">Recent Triage by Department – Coming Soon</div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="Bishoftu/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        <Route path="/admin/dashboard/users/add" element={<AddUser />} />

        {/* ===== NURSE ROUTES – PROTECTED ===== */}
      <Route >
  <Route path="/nurse" element={<NurseLayout />}>
    <Route index element={<Navigate to="/nurse/dashboard" replace />} />
    <Route path="dashboard" element={<NurseDashboard />} />
    <Route path="patients" element={<PatientListNurse />} />
    <Route path="patients/register" element={<RegisterPatientNurse />} />
    <Route path="patients/:id" element={<PatientDetailNurse />} />
    <Route path="visits/today" element={<TodayVisitsNurse />} />
    <Route path="visits/create" element={<CreateVisitNurse />} />
    <Route path="visits/create-triage" element={<CreateVisitAndTriageNurse />} />
    <Route path="visits/:id" element={<VisitDetailNurse />} />
    <Route path="triage/pending" element={<PendingTriageNurse />} />
    <Route path="triage/create" element={<CreateTriageNurse />} />
    <Route path="triage/:id" element={<TriageDetailNurse />} />
    <Route path="prescriptions/create" element={<CreatePrescriptionNurse />} />
    <Route path="prescriptions/:id" element={<PrescriptionDetailNurse />} />
    <Route path="laboratory/request" element={<RequestLabTestNurse />} />
    <Route path="laboratory/:id" element={<LabTestDetailNurse />} />
  </Route>
</Route>
        {/* Receptionist routes – protected */}
        <Route element={<ReceptionistProtectRouter />}>
          <Route path="/receptionist" element={<ReceptionistDashboard />}>
            <Route index element={<Navigate to="patients" replace />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="visits" element={<VisitList />} />
            <Route path="create-visit" element={<CreateVisit />} />
            <Route path="create-patient" element={<CreatePatient />} />
          </Route>
        </Route>

        {/* Doctor routes – protected */}
       {/* Doctor routes */}
{/* Doctor routes */}
<Route path="/doctor" element={<DoctorLayout />}>
  <Route index element={<DoctorDashboard />} />
  <Route path="consultation/triage" element={<ConsultationQueue />} />
  <Route
    path="consultation/patient/:patientId/:visitId"
    element={<ConsultationPatient />}
  />
  <Route path="adult/triage" element={<AdultMedicalCareQueue />} />
  <Route
    path="adult/patient/:patientId/:visitId"
    element={<AdultMedicalCarePatient />}
  />
  <Route path="maternal/triage" element={<MaternalChildQueue />} />
  <Route path="maternal/patient/:patientId/:visitId" element={<MaternalChildDashboard />} />
  <Route path="maternal/patient/:patientId/:visitId/pregnancies" element={<PregnancyList />} />
  <Route path="maternal/patient/:patientId/:visitId/pregnancies/register" element={<PregnancyRegistration />} />
  <Route path="maternal/patient/:patientId/:visitId/pregnancy/:pregnancyId" element={<PregnancyDetails />} />
  <Route path="maternal/patient/:patientId/:visitId/anc" element={<ANCQueue />} />
  <Route path="maternal/patient/:patientId/:visitId/anc/:ancVisitId" element={<ANCVisitDetails />} />
  <Route path="maternal/patient/:patientId/:visitId/risk" element={<RiskAssessment />} />
  <Route path="maternal/patient/:patientId/:visitId/high-risk" element={<HighRiskPregnancy />} />
  <Route path="maternal/patient/:patientId/:visitId/birth-preparedness" element={<BirthPreparedness />} />
  <Route path="maternal/patient/:patientId/:visitId/laboratory" element={<PregnancyLaboratoryOrder />} />
  <Route path="maternal/patient/:patientId/:visitId/ultrasound" element={<PregnancyUltrasound />} />
  <Route path="maternal/patient/:patientId/:visitId/medication" element={<PregnancyMedication />} />
  <Route path="maternal/patient/:patientId/:visitId/labor" element={<LaborRecord />} />
  <Route path="maternal/patient/:patientId/:visitId/delivery" element={<DeliveryRecord />} />
  <Route path="maternal/patient/:patientId/:visitId/delivery/:deliveryId/complications" element={<DeliveryComplication />} />
  <Route path="maternal/patient/:patientId/:visitId/delivery/:deliveryId/childbirths" element={<ChildBirth />} />
  <Route path="maternal/patient/:patientId/:visitId/pnc" element={<PNCVisit />} />
  <Route path="maternal/patient/:patientId/:visitId/family-planning" element={<FamilyPlanning />} />
  <Route path="maternal/patient/:patientId/:visitId/child-health" element={<ChildHealthDashboard />} />

  {/* Referrals — create MUST be above :referralId */}
  <Route path="referrals" element={<ReferralQueue />} />
  <Route path="referrals/create" element={<CreateReferral />} />
  <Route path="referrals/new" element={<CreateReferral />} />
  <Route path="referrals/:referralId" element={<ReferralDetails />} />
  <Route path="appointments" element={<Appointments />} />
</Route>

        {/* ===== CSM routes – protected with sidebar ===== */}
        <Route element={<CSMProtectRoute />}>
          <Route element={<CSMLayout />}>
            <Route path="/csm" element={<Navigate to="/csm/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="/csm/dashboard" element={<CSMDashboard />} />

            {/* Medicine Management */}
            <Route path="/csm/medicine" element={<MedicineList />} />
            <Route path="/csm/medicine/create" element={<CreateMedicine />} />
            <Route path="/csm/medicine/edit/:id" element={<EditMedicine />} />
            <Route path="/csm/medicine/:id" element={<MedicineDetails />} />
            <Route path="/csm/medicine/search" element={<MedicineSearch />} />

            {/* Inventory Management */}
            <Route path="/csm/inventory" element={<InventoryList />} />
            <Route path="/csm/inventory/create" element={<CreateInventory />} />
            <Route path="/csm/inventory/edit/:id" element={<EditInventory />} />
            <Route path="/csm/inventory/adjust/:id" element={<AdjustStock />} />
            <Route path="/csm/inventory/:id" element={<InventoryDetails />} />
            <Route path="/csm/inventory/history" element={<InventoryHistory />} />
            <Route path="/csm/inventory/low-stock" element={<LowStock />} />
            <Route path="/csm/inventory/expiring" element={<ExpiringMedicines />} />
            <Route path="/csm/inventory/expired" element={<ExpiredMedicines />} />
            <Route path="/csm/inventory/value" element={<InventoryValue />} />
            <Route path="/csm/inventory/receive-purchased" element={<ReceivePurchasedMedicine />} />
            <Route path="/csm/inventory/receive-aidstore" element={<ReceiveAidStoreTransfer />} />

            {/* Request Management */}
            <Route path="/csm/request" element={<RequestList />} />
            <Route path="/csm/request/:id" element={<RequestDetails />} />
            <Route path="/csm/request/review/:id" element={<RequestReview />} />
            <Route path="/csm/request/approve/:id" element={<ApproveRequest />} />
            <Route path="/csm/request/partial-approve/:id" element={<PartialApproveRequest />} />
            <Route path="/csm/request/reject/:id" element={<RejectRequest />} />
            <Route path="/csm/request/cancel/:id" element={<CancelRequest />} />
            <Route path="/csm/request/availability/:id" element={<RequestAvailability />} />

            {/* Transfer Management */}
            <Route path="/csm/transfer" element={<TransferList />} />
            <Route path="/csm/transfer/create" element={<CreateTransfer />} />
            <Route path="/csm/transfer/:id" element={<TransferDetails />} />
            <Route path="/csm/transfer/dispatch/:id" element={<DispatchTransfer />} />
            <Route path="/csm/transfer/track/:id" element={<TransferTracking />} />
            <Route path="/csm/transfer/update-status/:id" element={<UpdateTransferStatus />} />
            <Route path="/csm/transfer/cancel/:id" element={<CancelTransfer />} />
            <Route path="/csm/transfer/history" element={<TransferHistory />} />

            {/* Branch Management */}
            <Route path="/csm/branch" element={<BranchList />} />
            <Route path="/csm/branch/:id" element={<BranchDetails />} />
            <Route path="/csm/branch/:id/inventory" element={<BranchInventory />} />
            <Route path="/csm/branch/:id/requests" element={<BranchRequests />} />
            <Route path="/csm/branch/:id/transfers" element={<BranchTransfers />} />
            <Route path="/csm/branch/:id/consumption" element={<BranchConsumption />} />
            <Route path="/csm/branch/low-stock" element={<BranchLowStock />} />

            {/* Monitoring */}
            <Route path="/csm/monitoring" element={<LowStockMonitoring />} />
            <Route path="/csm/monitoring/low-stock" element={<LowStockMonitoring />} />
            <Route path="/csm/monitoring/expiry" element={<ExpiryMonitoring />} />
            <Route path="/csm/monitoring/expired" element={<ExpiredMedicinesMonitor />} />
            <Route path="/csm/monitoring/near-expiry" element={<NearExpiryMedicines />} />
            <Route path="/csm/monitoring/critical" element={<CriticalStock />} />
            <Route path="/csm/monitoring/replenishment" element={<ReplenishmentSuggestions />} />
            <Route path="/csm/monitoring/movement/:medicineId" element={<MedicineMovement />} />
            <Route path="/csm/monitoring/audit" element={<InventoryAudit />} />

            {/* Reports */}
            <Route path="/csm/report" element={<InventoryReport />} />
            <Route path="/csm/report/inventory" element={<InventoryReport />} />
            <Route path="/csm/report/branch-inventory/:branchId?" element={<BranchInventoryReport />} />
            <Route path="/csm/report/requests" element={<RequestReport />} />
            <Route path="/csm/report/transfers" element={<TransferReport />} />
            <Route path="/csm/report/expiry" element={<ExpiryReport />} />
            <Route path="/csm/report/consumption" element={<ConsumptionReport />} />
            <Route path="/csm/report/inventory-value" element={<InventoryValueReport />} />
            <Route path="/csm/report/stock-movement" element={<StockMovementReport />} />
          </Route>
        </Route>

        {/* ===== Pharmacist routes – protected ===== */}
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

        <Route path="/mlt/dashboard" element={<MLTDashboard />} />
        <Route path="/mlt/patients" element={<MLTPatient />} />
        <Route path="/mlt/queue" element={<MLTQueue />} />
        <Route path="/mlt/tests" element={<MLTTest />} />
        <Route path="/mlt/results" element={<MLTResult />} />
        <Route path="/mlt/reports" element={<MLTReport />} />
        <Route path="/mlt/laboratory-sections" element={<LaboratorySection />} />
        <Route path="/mlt/laboratory-sections/add" element={<AddSection />} />
        <Route path="/mlt/laboratory-sections/:sectionId" element={<SectionDetails />} />
        <Route path="/mlt/laboratory-sections/:sectionId/add-test-type" element={<AddTestType />} />

        {/* ===== Radiology ===== */}
        <Route path="/radiology" element={<RadiologyDashboard />} />

        <Route path="/radiology/radiographer" element={<RadiologyLayout mode="radiographer" />}>
          <Route index element={<RadiographerDashboard />} />
          <Route path="queue" element={<RadiographerQueue />} />
          <Route path="completed" element={<CompletedExaminations />} />
          <Route path="requests/:id" element={<RadiographerRequestDetails />} />
          <Route path="requests/:id/perform" element={<PerformExamination />} />
          <Route path="requests/:id/upload" element={<UploadRadiologyImage />} />
        </Route>

        <Route path="/radiology/radiologist" element={<RadiologyLayout mode="radiologist" />}>
          <Route index element={<RadiologistDashboard />} />
          <Route path="queue" element={<RadiologistQueue />} />
          <Route path="completed" element={<CompletedReports />} />
          <Route path="requests/:id" element={<RadiologistRequestDetails />} />
          <Route path="results/:id" element={<RadiologyResultWorkup />} />
        </Route>

        <Route path="/radiology/requests" element={<RadiologyLayout mode="doctor" />}>
          <Route index element={<RadiologyRequestList />} />
          <Route path="create" element={<CreateRadiologyRequest />} />
          <Route path=":id" element={<RadiologyRequestDetails />} />
          <Route path=":id/status" element={<UpdateRadiologyRequest />} />
        </Route>

        <Route path="/radiology/departments" element={<RadiologyLayout mode="radiographer" />}>
          <Route index element={<RadiologyDepartmentList />} />
          <Route path="create" element={<CreateRadiologyDepartment />} />
          <Route path=":id" element={<RadiologyDepartmentDetails />} />
          <Route path=":id/edit" element={<UpdateRadiologyDepartment />} />
        </Route>

        <Route path="/radiology/test-types" element={<RadiologyLayout mode="radiographer" />}>
          <Route index element={<RadiologyTestTypeList />} />
          <Route path="create" element={<CreateRadiologyTestType />} />
          <Route path=":id/edit" element={<UpdateRadiologyTestType />} />
        </Route>

        <Route path="/radiology/results/:id" element={<RadiologyLayout mode="doctor" />}>
          <Route index element={<RadiologyResultDetails />} />
        </Route>

        {/* Fallback routes */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;