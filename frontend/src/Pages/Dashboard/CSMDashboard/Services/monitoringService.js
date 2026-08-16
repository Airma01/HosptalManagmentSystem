import API from "../../../../Config/API";
/**
 * Monitoring API service.
 * All endpoints use withCredentials for authentication.
 */

export const getExpiredMedicines = async () => {
  const response = await API.get("/api/csm/monitoring/expired");
  return response.data;
};

export const getNearExpiryMedicines = async (days = 30) => {
  const response = await API.get("/api/csm/monitoring/near-expiry", {
    params: { days },
  });
  return response.data;
};

export const getCriticalStock = async () => {
  const response = await API.get("/api/csm/monitoring/critical-stock");
  return response.data;
};

export const getReplenishmentSuggestions = async () => {
  const response = await API.get("/api/csm/monitoring/replenishment-suggestions");
  return response.data;
};

export const getMedicineMovement = async (medicineId) => {
  const response = await API.get(`/api/csm/monitoring/medicine-movement/${medicineId}`);
  return response.data;
};

export const getInventoryAudit = async (from, to) => {
  const response = await API.get("/api/csm/monitoring/inventory-audit", {
    params: { from, to },
  });
  return response.data;
};