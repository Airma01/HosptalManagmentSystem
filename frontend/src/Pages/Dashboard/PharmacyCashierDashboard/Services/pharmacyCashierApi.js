import API from "../../../../Config/API";

const pharmacyCashierApi = {
  login: (data) =>
    API.post("/Hospital/PharmacyCashier/PharmacyCashierAuth/login", data),
  authMe: () =>
    API.get("/Hospital/PharmacyCashier/PharmacyCashierAuth/auth_me"),
  logout: () =>
    API.post("/Hospital/PharmacyCashier/PharmacyCashierAuth/logout"),

  getUnpaidPrescriptions: (params = {}) =>
    API.get("/Hospital/PharmacyCashier/unpaid-prescriptions", { params }),
  pay: (data) => API.post("/Hospital/PharmacyCashier/pay", data),
  todayCollection: () =>
    API.get("/Hospital/PharmacyCashier/today-collection"),
};

export default pharmacyCashierApi;
