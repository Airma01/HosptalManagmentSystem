import API from "../../../../Config/API";
/**
 * Central Store Request API service.
 * All endpoints use withCredentials for authentication.
 */

export const getPendingRequests = async () => {
  const response = await API.get("/api/csm/request/pending");
  return response.data;
};

export const getApprovedRequests = async () => {
  const response = await API.get("/api/csm/request/approved");
  return response.data;
};

export const getRejectedRequests = async () => {
  const response = await API.get("/api/csm/request/rejected");
  return response.data;
};

export const getRequestById = async (id) => {
  const response = await API.get(`/api/csm/request/${id}`);
  return response.data;
};

export const getRequestReview = async (id) => {
  const response = await API.get(`/api/csm/request/review/${id}`);
  return response.data;
};

export const getRequestAvailability = async (id) => {
  const response = await API.get(`/api/csm/request/availability/${id}`);
  return response.data;
};

export const approveRequest = async (data) => {
  const response = await API.post("/api/csm/request/approve", data);
  return response.data;
};

export const partialApproveRequest = async (data) => {
  const response = await API.post("/api/csm/request/partial-approve", data);
  return response.data;
};

export const rejectRequest = async (data) => {
  const response = await API.post("/api/csm/request/reject", data);
  return response.data;
};

export const cancelRequest = async (data) => {
  const response = await API.post("/api/csm/request/cancel", data);
  return response.data;
};