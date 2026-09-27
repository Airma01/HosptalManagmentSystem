import API from "../../../../Config/API";

const laboratoryCashierApi = {
  login: (data) =>
    API.post("/Hospital/LaboratoryCashier/LaboratoryCashierAuth/login", data),
  authMe: () =>
    API.get("/Hospital/LaboratoryCashier/LaboratoryCashierAuth/auth_me"),
  logout: () =>
    API.post("/Hospital/LaboratoryCashier/LaboratoryCashierAuth/logout"),

  getUnpaidTests: (params = {}) =>
    API.get("/Hospital/LaboratoryCashier/unpaid-tests", { params }),
  pay: (data) => API.post("/Hospital/LaboratoryCashier/pay", data),
  todayCollection: () =>
    API.get("/Hospital/LaboratoryCashier/today-collection"),
};

export default laboratoryCashierApi;
