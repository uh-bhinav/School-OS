import axios from "axios";
import { getAccessToken } from "./supabase";

const baseURL = import.meta.env.VITE_API_BASE_URL;

// In development mode, allow empty baseURL for MSW (Mock Service Worker)
// In production, baseURL must be set
if (!baseURL && import.meta.env.PROD) {
  throw new Error(
    "Missing API base URL. Please check your .env file for VITE_API_BASE_URL."
  );
}

// If baseURL is empty (dev mode with MSW), use relative URLs
// MSW will intercept these requests and return mock data
const resolvedBaseURL = baseURL || "";

if (!baseURL && import.meta.env.DEV) {
  console.log("🔶 HTTP Client: Running in MOCK mode (MSW will intercept all requests)");
} else {
  console.log("🔶 HTTP Client: API Base URL:", resolvedBaseURL);
}

export const http = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Add auth token
http.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle common errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - could redirect to login
        console.error("Unauthorized request:", data);
      } else if (status === 403) {
        console.error("Forbidden:", data);
      } else if (status >= 500) {
        console.error("Server error:", data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error("Network error: No response received");
    } else {
      // Something else happened
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);
