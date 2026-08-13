import API from "../../../../Config/API";

const pharmacyApi = {
  // ========== DASHBOARD ==========
  getDashboard: () => API.get("/Hospital/Pharmacy/BranchPharmacy/GetDashboard"),

  // ========== INVENTORY ==========
  getInventory: () => API.get("/Hospital/Pharmacy/BranchPharmacy/GetInventory"),
  getMedicineStock: (medicineId) =>
    API.get(`/Hospital/Pharmacy/BranchPharmacy/GetMedicineStock/${medicineId}`),
  getLowStockMedicines: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetLowStockMedicines"),
  getExpiredMedicines: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetExpiredMedicines"),
  getNearExpiryMedicines: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetNearExpiryMedicines"),

  // ========== REQUESTS ==========
  createCentralStoreRequest: (data) =>
    API.post("/Hospital/Pharmacy/BranchPharmacy/CreateCentralStoreRequest", data),
  getMyRequests: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetMyRequests"),
  getRequestDetails: (requestId) =>
    API.get(`/Hospital/Pharmacy/BranchPharmacy/GetRequestDetails/${requestId}`),
  cancelRequest: (requestId, data) =>
    API.put(`/Hospital/Pharmacy/BranchPharmacy/CancelRequest/${requestId}`, data),

  // ========== TRANSFERS ==========
  getReceivedTransfers: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetReceivedTransfers"),
  getTransferDetails: (transferId) =>
    API.get(`/Hospital/Pharmacy/BranchPharmacy/GetTransferDetails/${transferId}`),
  acceptTransfer: (transferId, data) =>
    API.put(`/Hospital/Pharmacy/BranchPharmacy/AcceptTransfer/${transferId}`, data),
  rejectTransfer: (transferId, data) =>
    API.put(`/Hospital/Pharmacy/BranchPharmacy/RejectTransfer/${transferId}`, data),

  // ========== PRESCRIPTIONS ==========
  getPendingPrescriptions: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetPendingPrescriptions"),
  getPrescriptionDetails: (prescriptionId) =>
    API.get(`/Hospital/Pharmacy/BranchPharmacy/GetPrescriptionDetails/${prescriptionId}`),
  checkMedicineAvailability: (prescriptionId) =>
    API.get(`/Hospital/Pharmacy/BranchPharmacy/CheckMedicineAvailability/${prescriptionId}`),

  // ========== DISPENSING ==========
  dispenseMedicine: (data) =>
    API.post("/Hospital/Pharmacy/BranchPharmacy/DispenseMedicine", data),
  getDispenseHistory: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetDispenseHistory"),
  getDispenseDetails: (dispenseId) =>
    API.get(`/Hospital/Pharmacy/BranchPharmacy/GetDispenseDetails/${dispenseId}`),

  // ========== REPORTS ==========
  getStockReport: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetStockReport"),
  getRequestReport: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetRequestReport"),
  getTransferReport: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetTransferReport"),
  getDispenseReport: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetDispenseReport"),
  getExpiryReport: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetExpiryReport"),

  // ========== PROFILE ==========
  getProfile: () =>
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetProfile"),
  changePassword: (data) =>
    API.put("/Hospital/Pharmacy/BranchPharmacy/ChangePassword", data),

  // ========== AUTH (External) ==========
  getAuthMe: () =>
    API.get("/Hospital/Pharmacist/PharmacistAuth/auth_me"),

  getAllMedicines: () => 
    API.get("/Hospital/Pharmacy/BranchPharmacy/GetAllMedicines"),
};

export default pharmacyApi;