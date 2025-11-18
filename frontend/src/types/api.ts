/**
 * ViteviteApp - API Client
 * Axios client avec interceptors et error handling
 */

import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (ajoute le token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (gère le refresh token)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si 401 et pas déjà retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });

          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);

          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch {
          // Refresh failed, logout
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// ========== AUTH ==========
export const authAPI = {
  register: (data: { email: string; password: string; full_name?: string; phone?: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getMe: () => api.get("/auth/me"),
};

// ========== SERVICES ==========
export const servicesAPI = {
  getAll: (params?: { category?: string; status?: string }) =>
    api.get("/services", { params }),

  getById: (id: string) => api.get(`/services/${id}`),

  getQueue: (id: string) => api.get(`/services/${id}/queue`),
};

// ========== TICKETS ==========
export const ticketsAPI = {
  create: (data: { service_id: string; user_name?: string; user_phone?: string; notes?: string }) =>
    api.post("/tickets", data),

  getById: (id: string) => api.get(`/tickets/${id}`),

  getMyTickets: () => api.get("/tickets/user/me"),

  cancel: (id: string) => api.delete(`/tickets/${id}`),
};

// ========== PREDICTIONS ==========
export const predictionsAPI = {
  predict: (serviceId: string) => api.post(`/predictions/${serviceId}`),
};

export default api;