import axios from "axios";

// Vite exposes only variables prefixed with VITE_
// Falls back to local backend if the env var is not set
const baseURL = import.meta.env.VITE_API_BASE_URL;

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    // Do NOT set Content-Type globally
  },
});

API.interceptors.request.use(
  (config) => {
    // JSON only when body is a plain object (not FormData)
    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    } else if (config.data instanceof FormData) {
      // Critical: let browser set multipart boundary
      delete config.headers["Content-Type"];
    }

    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Response Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Network Error:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default API;