import API from "../../../../Config/API";

export const getDoctorAppointments = () =>
  API.get("/api/doctor/appointments");

export const getDoctorAppointmentDetails = (appointmentId) =>
  API.get(`/api/doctor/appointments/${appointmentId}`);

export const startDoctorAppointment = (appointmentId) =>
  API.post("/api/doctor/appointments/start", { appointmentID: appointmentId });

export const createDoctorAppointment = (payload) =>
  API.post("/api/doctor/appointments", payload);

// NEW – for patient search in Create Appointment form
export const getPatientsForSearch = () =>
  API.get("/api/doctor/patients");