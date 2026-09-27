import API from "../../../../Config/API";

const cashierApi = {
  // ========== AUTH ==========
  login: (data) => API.post("/Hospital/Cashier/CashierAuth/login", data),
  authMe: () => API.get("/Hospital/Cashier/CashierAuth/auth_me"),
  logout: () => API.post("/Hospital/Cashier/CashierAuth/logout"),

  // ========== BILLS & PAYMENTS ==========
  getUnpaidBills: (params = {}) =>
    API.get("/Hospital/Cashier/unpaid-bills", { params }),
  getBill: (billId) => API.get(`/Hospital/Cashier/bill/${billId}`),
  pay: (data) => API.post("/Hospital/Cashier/pay", data),
  todayCollection: () => API.get("/Hospital/Cashier/today-collection"),
};

export default cashierApi;
