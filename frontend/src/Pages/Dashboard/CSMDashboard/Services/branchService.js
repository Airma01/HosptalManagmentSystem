import API from "../../../../Config/API";
/**
 * Branch pharmacy management API service.
 * All endpoints use withCredentials for authentication.
 */

export const getAllBranches = async () => {
  const response = await API.get("/api/csm/branch/all");
  return response.data;
};

export const getBranchById = async (id) => {
  const response = await API.get(`/api/csm/branch/${id}`);
  return response.data;
};

export const getBranchInventory = async (branchId) => {
  const response = await API.get(`/api/csm/branch/inventory/${branchId}`);
  return response.data;
};

export const getBranchRequests = async (branchId) => {
  const response = await API.get(`/api/csm/branch/requests/${branchId}`);
  return response.data;
};

export const getBranchTransfers = async (branchId) => {
  const response = await API.get(`/api/csm/branch/transfers/${branchId}`);
  return response.data;
};

export const getBranchConsumption = async (branchId, from, to) => {
  const response = await API.get(`/api/csm/branch/consumption/${branchId}`, {
    params: { from, to },
  });
  return response.data;
};

export const getLowStockBranches = async () => {
  const response = await API.get("/api/csm/branch/low-stock");
  return response.data;
};