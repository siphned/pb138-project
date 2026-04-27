import { axiosInstance } from "@kubb/plugin-client/clients/axios";

// Configure base URL if not already set
if (!axiosInstance.defaults.baseURL) {
  axiosInstance.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
}

export default axiosInstance;
