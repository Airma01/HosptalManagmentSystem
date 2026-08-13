import API from "../../../../Config/API";

const BASE = "/Hospital/CSM/CentralStore";

// ========== DASHBOARD ==========
export const getDashboard = async () => {
  const res = await API.get(`${BASE}/dashboard`);
  return res.data;
};

// ========== MEDICINES ==========
export const getMedicines = async (search = "", page = 1, pageSize = 20) => {
  const res = await API.get(`${BASE}/medicines`, {
    params: { search, page, pageSize },
  });
  return res.data;
};

export const getMedicineById = async (id) => {
  const res = await API.get(`${BASE}/medicines/${id}`);
  return res.data;
};

export const createMedicine = async (data) => {
  const res = await API.post(`${BASE}/medicines`, data);
  return res.data;
};

export const updateMedicine = async (id, data) => {
  const res = await API.put(`${BASE}/medicines/${id}`, data);
  return res.data;
};

export const deactivateMedicine = async (id) => {
  const res = await API.patch(`${BASE}/medicines/${id}/deactivate`);
  return res.data;
};

// ========== INVENTORY ==========
export const getInventory = async (page = 1, pageSize = 20) => {
  const res = await API.get(`${BASE}/inventory`, {
    params: { page, pageSize },
  });
  return res.data;
};

export const addInventory = async (data) => {
  const res = await API.post(`${BASE}/inventory`, data);
  return res.data;
};

export const updateInventory = async (id, data) => {
  const res = await API.patch(`${BASE}/inventory/${id}`, data);
  return res.data;
};

export const getLowStockMedicines = async (threshold = 10) => {
  const res = await API.get(`${BASE}/inventory/lowstock`, {
    params: { threshold },
  });
  return res.data;
};

export const getExpiredMedicines = async () => {
  const res = await API.get(`${BASE}/inventory/expired`);
  return res.data;
};

// ========== REQUESTS ==========
export const getPendingRequests = async (page = 1, pageSize = 20) => {
  const res = await API.get(`${BASE}/requests/pending`, {
    params: { page, pageSize },
  });
  return res.data;
};

export const getRequestDetails = async (id) => {
  const res = await API.get(`${BASE}/requests/${id}`);
  return res.data;
};

export const approveRequest = async (id, data) => {
  const res = await API.put(`${BASE}/requests/${id}/approve`, data);
  return res.data;
};

export const rejectRequest = async (id, data) => {
  const res = await API.put(`${BASE}/requests/${id}/reject`, data);
  return res.data;
};

// ========== TRANSFERS ==========
export const createTransfer = async (data) => {
  const res = await API.post(`${BASE}/transfers`, data);
  return res.data;
};

export const getTransfers = async (page = 1, pageSize = 20) => {
  const res = await API.get(`${BASE}/transfers`, {
    params: { page, pageSize },
  });
  return res.data;
};

export const getTransferDetails = async (id) => {
  const res = await API.get(`${BASE}/transfers/${id}`);
  return res.data;
};

// ========== REPORTS ==========
export const getStockReport = async () => {
  const res = await API.get(`${BASE}/reports/stock`);
  return res.data;
};

export const getTransferReport = async (from = null, to = null) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const res = await API.get(`${BASE}/reports/transfers`, { params });
  return res.data;
};

export const getRequestReport = async (from = null, to = null) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const res = await API.get(`${BASE}/reports/requests`, { params });
  return res.data;
};
// ========== BRANCHES ==========
// Add this function – if the admin endpoint exists, use it; else try to get from central store
// ========== BRANCHES ==========
export const getBranches = async () => {
  const res = await API.get("/Hospital/CSM/CentralStore/branches");
  return res.data; // returns an array of { branchPharmacyID, branchName }
};
