import API from "../../Config/API";

const BASE = "/Hospital/admin/security";

export const securityService = {
  getStatistics: (params = {}) =>
    API.get(`${BASE}/statistics`, { params }).then((r) => r.data),

  getAuditLogs: (params = {}) =>
    API.get(`${BASE}/audit-logs`, { params }).then((r) => r.data),

  getApiRequests: (params = {}) =>
    API.get(`${BASE}/api-requests`, { params }).then((r) => r.data),

  getEvents: (params = {}) =>
    API.get(`${BASE}/events`, { params }).then((r) => r.data),

  getBlockedIps: (activeOnly = true) =>
    API.get(`${BASE}/blocked-ips`, { params: { activeOnly } }).then((r) => r.data),

  blockIp: (payload) =>
    API.post(`${BASE}/blocked-ips`, payload).then((r) => r.data),

  unblockIp: (id) =>
    API.delete(`${BASE}/blocked-ips/${id}`).then((r) => r.data),
};

export default securityService;
