import API from '../../../../Config/API';

/**
 * Laboratory payment tracking (same pattern as pharmacy / radiology).
 * Backend (from payment integration package):
 *   GET /Hospital/Laboratory/tests-payment-status
 *   GET /Hospital/Laboratory/tests/{id}/ensure-paid
 *
 * LaboratoryPayments.LaboratoryTestID + PaymentStatus = "Paid"
 */
export const getLabTestsPaymentStatus = (params = {}) =>
  API.get('/Hospital/Laboratory/tests-payment-status', { params });

export const ensureLabTestPaid = (testId) =>
  API.get(`/Hospital/Laboratory/tests/${testId}/ensure-paid`);
