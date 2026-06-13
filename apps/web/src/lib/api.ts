import axios, { type AxiosInstance, type AxiosError } from "axios";
import { toast } from "sonner";
import { env } from "./env";

const api: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("evalai_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — global error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; detail?: string }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";

    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("evalai_token");
        window.location.href = "/login";
      }
    } else if (status === 403) {
      toast.error("You don't have permission to do that.");
    } else if (status === 404) {
      // Let individual queries handle 404s
    } else if (status && status >= 500) {
      toast.error(`Server error: ${message}`);
    } else if (status && status >= 400) {
      toast.error(message);
    } else if (!error.response) {
      toast.error("Network error — please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default api;
