import API from '../../../../Config/API';

/**
 * Payment tracking for radiographer (must match backend controller routes).
 * Prefer same host as other radiology APIs.
 *
 * If you mounted RadiographerPaymentStatusController as:
 *   [Route("Hospital/Radiology")]
 * use the paths below.
 *
 * Optionally also expose payment on:
 *   GET /radiology/Radiographer/queue  (add paymentStatus in backend)
 */
export const getRequestsPaymentStatus = (params = {}) =>
  API.get('/Hospital/Radiology/requests-payment-status', { params });

export const ensureRadiologyPaid = (requestId) =>
  API.get(`/Hospital/Radiology/requests/${requestId}/ensure-paid`);

export const getRequestPaymentStatus = (requestId) =>
  API.get(`/Hospital/Radiology/requests/${requestId}/ensure-paid`);
