import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("chatroomx_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
