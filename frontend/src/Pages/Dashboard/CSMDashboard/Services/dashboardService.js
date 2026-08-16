import API from "../../../../Config/API";
/**
 * Dashboard API service functions.
 * All endpoints use withCredentials to send the HttpOnly JWT cookie.
 */

export const getDashboardSummary = async () => {
  const response = await API.get("/api/csm/dashboard/summary");
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await API.get("/api/csm/dashboard/stats");
  return response.data;
};

export const getLowStockMedicines = async () => {
  const response = await API.get("/api/csm/dashboard/low-stock");
  return response.data;
};

export const getExpiringMedicines = async (days = 30) => {
  const response = await API.get("/api/csm/dashboard/expiring-medicines", {
    params: { days },
  });
  return response.data;
};

export const getInventoryValue = async () => {
  const response = await API.get("/api/csm/dashboard/inventory-value");
  return response.data;
};

export const getBranchAlerts = async () => {
  const response = await API.get("/api/csm/dashboard/branch-alerts");
  return response.data;
};