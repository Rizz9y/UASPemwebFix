import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Get API base URL from environment variables
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add JWT token to every request that needs authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle expired tokens or 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 Unauthorized error and it's not a retry already
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request as retried

      // Optional: Check if token is actually expired (less critical if backend handles 401 for all auth issues)
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            console.warn("Authentication token expired. Redirecting to login.");
          }
        } catch (decodeError) {
          console.error("Invalid token format during decoding:", decodeError);
        }
      }

      // Clear authentication data from storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page to force re-authentication.
      // Using window.location.href forces a full page reload, clearing React state.
      window.location.href = "/login";

      return Promise.reject(error); // Reject the promise to stop further processing
    }

    // For other error statuses or if already retried 401, just reject the promise
    return Promise.reject(error);
  }
);

export default api;
