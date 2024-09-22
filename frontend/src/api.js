import axios from "axios";

const api = axios.create({
//   baseURL: "http://localhost:5000",
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login'; // Redirect to login on token expiry
    }
    return Promise.reject(error);
  }
);

export default api;
