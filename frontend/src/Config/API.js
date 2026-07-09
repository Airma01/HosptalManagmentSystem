// Config/API.js - CORRECT VERSION
import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5241",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",  // ✅ Correct for JSON APIs
        "Accept": "application/json"
    }
});

// Add interceptors for debugging
API.interceptors.request.use(
    (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        console.log("Request Headers:", config.headers);
        console.log("Request Data:", config.data);
        return config;
    },
    (error) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`);
        console.log("Response Headers:", response.headers);
        return response;
    },
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