import axios from "axios";

const cashierApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // backend base
});

cashierApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default cashierApi;
