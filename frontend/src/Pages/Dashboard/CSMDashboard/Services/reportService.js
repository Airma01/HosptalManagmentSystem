import API from "../../../../Config/API";
/**
 * Reports API service.
 * All endpoints use withCredentials for authentication.
 */

export const getInventoryReport = async () => {
  const response = await API.get("/api/csm/report/inventory");
  return response.data;
};

export const getBranchInventoryReport = async (branchId) => {
  const response = await API.get(`/api/csm/report/branch-inventory/${branchId}`);
  return response.data;
};

export const getRequestReport = async (from, to) => {
  const response = await API.get("/api/csm/report/requests", {
    params: { from, to },
  });
  return response.data;
};

export const getTransferReport = async (from, to) => {
  const response = await API.get("/api/csm/report/transfers", {
    params: { from, to },
  });
  return response.data;
};

export const getExpiryReport = async () => {
  const response = await API.get("/api/csm/report/expiry");
  return response.data;
};

export const getConsumptionReport = async (from, to) => {
  const response = await API.get("/api/csm/report/consumption", {
    params: { from, to },
  });
  return response.data;
};

export const getInventoryValueReport = async () => {
  const response = await API.get("/api/csm/report/inventory-value");
  return response.data;
};

export const getStockMovementReport = async (from, to) => {
  const response = await API.get("/api/csm/report/stock-movement", {
    params: { from, to },
  });
  return response.data;
};