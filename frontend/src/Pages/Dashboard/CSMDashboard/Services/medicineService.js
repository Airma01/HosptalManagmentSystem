import API from "../../../../Config/API";
/**
 * Medicine management API service.
 * All endpoints use withCredentials for authentication.
 */

export const createMedicine = async (data) => {
  const response = await API.post("/api/csm/medicine/create", data);
  return response.data;
};

export const updateMedicine = async (id, data) => {
  const response = await API.put(`/api/csm/medicine/update/${id}`, data);
  return response.data;
};

export const deleteMedicine = async (id) => {
  const response = await API.delete(`/api/csm/medicine/delete/${id}`);
  return response.data;
};

export const getAllMedicines = async () => {
  const response = await API.get("/api/csm/medicine/all");
  return response.data;
};

export const getMedicineById = async (id) => {
  const response = await API.get(`/api/csm/medicine/${id}`);
  return response.data;
};

export const searchMedicines = async (params) => {
  const response = await API.post("/api/csm/medicine/search", params);
  return response.data;
};