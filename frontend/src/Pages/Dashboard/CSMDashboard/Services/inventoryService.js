import API from "../../../../Config/API";
/**
 * Central Store Inventory API service.
 * All endpoints use withCredentials for authentication.
 */

export const receivePurchasedMedicine = async (data) => {
  const response = await API.post("/api/csm/inventory/receive-purchased", data);
  return response.data;
};

export const receiveAidStoreTransfer = async (data) => {
  const response = await API.post("/api/csm/inventory/receive-aidstore", data);
  return response.data;
};

export const createInventory = async (data) => {
  const response = await API.post("/api/csm/inventory/create", data);
  return response.data;
};

export const updateInventory = async (id, data) => {
  const response = await API.put(`/api/csm/inventory/update/${id}`, data);
  return response.data;
};

export const deleteInventory = async (id) => {
  const response = await API.delete(`/api/csm/inventory/delete/${id}`);
  return response.data;
};

export const getAllInventory = async () => {
  const response = await API.get("/api/csm/inventory/all");
  return response.data;
};

export const getInventoryById = async (id) => {
  const response = await API.get(`/api/csm/inventory/${id}`);
  return response.data;
};

export const searchInventory = async (params) => {
  const response = await API.post("/api/csm/inventory/search", params);
  return response.data;
};

export const adjustStock = async (data) => {
  const response = await API.post("/api/csm/inventory/adjust-stock", data);
  return response.data;
};

export const getInventoryHistory = async () => {
  const response = await API.get("/api/csm/inventory/history");
  return response.data;
};

export const getLowStock = async () => {
  const response = await API.get("/api/csm/inventory/low-stock");
  return response.data;
};

export const getExpiring = async (days = 30) => {
  const response = await API.get("/api/csm/inventory/expiring", {
    params: { days },
  });
  return response.data;
};

export const getExpired = async () => {
  const response = await API.get("/api/csm/inventory/expired");
  return response.data;
};

export const getTotalInventoryValue = async () => {
  const response = await API.get("/api/csm/inventory/total-inventory-value");
  return response.data;
};