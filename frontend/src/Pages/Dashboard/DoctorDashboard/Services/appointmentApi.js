import API from "../../../../Config/API";

/**
 * Doctor Appointment API
 * Maps to: DoctorAppointmentController → /api/doctor/appointments
 */

export const getDoctorAppointments = () =>
  API.get("/api/doctor/appointments");

export const getDoctorAppointmentDetails = (appointmentId) =>
  API.get(`/api/doctor/appointments/${appointmentId}`);

export const startDoctorAppointment = (appointmentId) =>
  API.post("/api/doctor/appointments/start", { appointmentID: appointmentId });
export const createDoctorAppointment = (payload) =>
  API.post("/api/doctor/appointments", payload);