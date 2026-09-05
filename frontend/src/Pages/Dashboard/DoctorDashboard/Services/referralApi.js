import API from "../../../../Config/API";

/**
 * Referral API service — maps to existing backend controllers:
 * - ReferralController      → /api/referral
 * - ReferralQueueController → /api/referral-queue
 * - ReferralVisitController → /api/referral-visit
 *
 * Uses the shared Axios instance (withCredentials: true).
 */

// ─── Referral lifecycle (ReferralController) ───────────────────────────────

export const createReferral = (payload) =>
  API.post("/api/referral", payload);

export const getReferral = (id) =>
  API.get(`/api/referral/${id}`);

export const updateReferral = (id, payload) =>
  API.put(`/api/referral/${id}`, payload);

export const acceptReferral = (id) =>
  API.post(`/api/referral/${id}/accept`);

export const rejectReferral = (id, payload) =>
  API.post(`/api/referral/${id}/reject`, payload ?? {});

export const cancelReferral = (id) =>
  API.post(`/api/referral/${id}/cancel`);

export const getMyReferrals = () =>
  API.get("/api/referral/mine");

export const getDepartments = () =>
  API.get("/api/referral/departments");

// ─── Incoming queue (ReferralQueueController) ──────────────────────────────

export const getIncomingReferrals = () =>
  API.get("/api/referral-queue");

export const getPendingReferrals = () =>
  API.get("/api/referral-queue/pending");

export const getAcceptedReferrals = () =>
  API.get("/api/referral-queue/accepted");

export const getRejectedReferrals = () =>
  API.get("/api/referral-queue/rejected");

export const getReferralDetails = (referralId) =>
  API.get(`/api/referral-queue/${referralId}`);

// ─── Visits & triage (ReferralVisitController) ─────────────────────────────

export const getPatientVisits = (patientId) =>
  API.get(`/api/referral-visit/patient/${patientId}`);

export const getRecentPatientVisit = (patientId) =>
  API.get(`/api/referral-visit/patient/${patientId}/recent`);

export const getVisit = (visitId) =>
  API.get(`/api/referral-visit/${visitId}`);

export const getVisitTriage = (visitId) =>
  API.get(`/api/referral-visit/${visitId}/triage`);

export const searchPatients = (q) => API.get("/api/referral/patients/search", { params: { q } });
export const getPatientVisitsForCreate = (patientId) =>
  API.get(`/api/referral/patients/${patientId}/visits`);


