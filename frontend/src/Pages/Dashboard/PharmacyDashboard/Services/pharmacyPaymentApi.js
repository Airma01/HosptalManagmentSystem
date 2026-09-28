import API from "../../../../Config/API";

export const getPrescriptionsPaymentStatus = (params = {}) =>
  API.get("/Hospital/BranchPharmacy/prescriptions-payment-status", { params });

export const getPrescriptionPaymentStatus = (prescriptionId) =>
  API.get(
    `/Hospital/BranchPharmacy/prescriptions/${prescriptionId}/payment-status`
  );

export const ensurePrescriptionPaid = (prescriptionId) =>
  API.get(
    `/Hospital/BranchPharmacy/prescriptions/${prescriptionId}/ensure-paid`
  );