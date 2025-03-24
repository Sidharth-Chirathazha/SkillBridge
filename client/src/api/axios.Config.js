import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  
});

//Function to refresh Access Token
const refreshAccessToken = async() =>{
  try {
    const refreshToken = localStorage.getItem("refresh_token")
    if(!refreshToken){
      throw new Error("No refresh token available")
    }

    const response = await axios.post(`${BASE_URL}token/refresh/`, { refresh: refreshToken });
    const newAccessToken = response.data.access;
    localStorage.setItem("access_token", newAccessToken)

    return newAccessToken;

  }catch (error) {
    console.error("Error refreshing access token", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login"; // Redirect to login on failure
    return null;
  }
}

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


    // Only set "Content-Type" for JSON requests
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const originalRequest = error.config;

      // Handle 401: Unauthorized
      if (error.response.status === 401) {
        console.warn("Access token expired or invalid. Checking refresh token...");

        const refreshToken = localStorage.getItem("refresh_token");

        // If no refresh token is available, logout the user
        if (!refreshToken) {
          console.error("No refresh token available. Logging out user.");
          handleLogout(); // Ensure clean logout
          return Promise.reject(error);
        }

        // Attempt to refresh token if it hasn't been retried yet
        if (!originalRequest._retry) {
          originalRequest._retry = true;

          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            console.log("Token refreshed successfully. Retrying request.");
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest); // Retry request with new token
          }
        }

        console.error("Token refresh failed. Logging out user.");
        handleLogout();
        return Promise.reject(error);
      }

      // Handle 403: Forbidden (If user is inactive)
      if (error.response.status === 403) {
        console.error("Access denied. Logging out user.");
        handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Logout function
const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login"; // Redirect to login
};


export default axiosInstance;

