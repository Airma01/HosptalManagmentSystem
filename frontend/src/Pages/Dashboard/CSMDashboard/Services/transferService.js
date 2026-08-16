import API from "../../../../Config/API";
/**
 * Central Store Transfer API service.
 * All endpoints use withCredentials for authentication.
 */

export const createTransfer = async (data) => {
  const response = await API.post("/api/csm/transfer/create", data);
  return response.data;
};

export const getAllTransfers = async () => {
  const response = await API.get("/api/csm/transfer/all");
  return response.data;
};

export const getTransferById = async (id) => {
  const response = await API.get(`/api/csm/transfer/${id}`);
  return response.data;
};

export const trackTransfer = async (id) => {
  const response = await API.get(`/api/csm/transfer/track/${id}`);
  return response.data;
};

export const dispatchTransfer = async (data) => {
  const response = await API.post("/api/csm/transfer/dispatch", data);
  return response.data;
};

export const updateTransferStatus = async (data) => {
  const response = await API.put("/api/csm/transfer/update-status", data);
  return response.data;
};

export const cancelTransfer = async (data) => {
  const response = await API.post("/api/csm/transfer/cancel", data);
  return response.data;
};