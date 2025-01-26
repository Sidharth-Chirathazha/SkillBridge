import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api/";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  
});

// Add a request interceptor to include token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    // Handle requests requiring authentication
    if (config.requiresAuth && !token) {
      // Redirect to login page if token is missing
      console.error("Access token is missing. Redirecting to login.");
      window.location.href = "/login";
      return Promise.reject(new Error("Token is missing. Redirecting to login."));
    }

    // Add token to headers if it exists
    if (config.requiresAuth && token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Request Headers:", config.headers);

    // Only set "Content-Type" for JSON requests
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token-related errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token expiration or invalid token
      localStorage.removeItem("access_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

