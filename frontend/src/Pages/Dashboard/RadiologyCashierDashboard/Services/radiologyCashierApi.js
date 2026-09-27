import API from "../../../../Config/API";

const radiologyCashierApi = {
  login: (data) =>
    API.post("/Hospital/RadiologyCashier/RadiologyCashierAuth/login", data),
  authMe: () =>
    API.get("/Hospital/RadiologyCashier/RadiologyCashierAuth/auth_me"),
  logout: () =>
    API.post("/Hospital/RadiologyCashier/RadiologyCashierAuth/logout"),

  getUnpaidRequests: (params = {}) =>
    API.get("/Hospital/RadiologyCashier/unpaid-requests", { params }),
  pay: (data) => API.post("/Hospital/RadiologyCashier/pay", data),
  todayCollection: () =>
    API.get("/Hospital/RadiologyCashier/today-collection"),
};

export default radiologyCashierApi;
