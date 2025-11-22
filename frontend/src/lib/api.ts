import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

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
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/auth";
        }
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; full_name?: string; phone?: string; role?: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getMe: () => api.get("/auth/me"),
};

export const servicesAPI = {
  getAll: (params?: { category?: string; status?: string }) =>
    api.get("/services", { params }),

  getById: (id: string) => api.get(`/services/${id}`),
};

export const ticketsAPI = {
  create: (data: { service_id: string; user_name?: string; user_phone?: string; notes?: string }) =>
    api.post("/tickets", data),

  getById: (id: string) => api.get(`/tickets/${id}`),

  getMyTickets: () => api.get("/tickets/user/me"),

  cancel: (id: string) => api.delete(`/tickets/${id}`),

  callNext: (serviceId: string) => api.post(`/tickets/call-next/${serviceId}`, {}),

  complete: (ticketId: string) => api.post(`/tickets/${ticketId}/complete`, {}),

  getTodayStats: () => api.get("/tickets/stats/today"),
};

export const predictionsAPI = {
  predict: (serviceId: string) => api.post(`/predictions/${serviceId}`),
};

export const chatAPI = {
  sendMessage: (message: string, history?: any[]) => api.post("/chat", { message, history }),
};

export const aiAPI = {
  predictAffluence: (serviceId: string, historicalData?: any[]) =>
    api.post("/ai/predict-affluence", { service_id: serviceId, historical_data: historicalData }),

  analyzeTrends: (serviceId: string, historicalData?: any[]) =>
    api.post(`/ai/analyze-trends/${serviceId}`, historicalData || []),

  detectAnomalies: (serviceId: string) =>
    api.post(`/ai/detect-anomalies/${serviceId}`),

  medicalTriage: (symptoms: string, patientInfo?: any, includeHospitals = true) =>
    api.post("/ai/triage", { symptoms, patient_info: patientInfo, include_hospitals: includeHospitals }),

  recommendHospital: (urgencyLevel: string, specialty: string, userLocation?: { lat: number; lng: number }) =>
    api.post("/ai/recommend-hospital", { urgency_level: urgencyLevel, specialty, user_location: userLocation }),

  generateDocumentChecklist: (serviceType: string, requestType: string, userInfo?: any) =>
    api.post("/ai/documents/checklist", { service_type: serviceType, request_type: requestType, user_info: userInfo }),

  analyzeDocuments: (userDocuments: any[], requiredDocuments: any[]) =>
    api.post("/ai/documents/analyze", { user_documents: userDocuments, required_documents: requiredDocuments }),

  generateNotification: (notificationType: string, context: any) =>
    api.post("/ai/notification/generate", { notification_type: notificationType, context }),

  getBestTime: (serviceId: string) =>
    api.get(`/ai/best-time/${serviceId}`),

  healthCheck: () => api.get("/ai/health"),
};

export const mapsAPI = {
  getDirections: (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode = "driving") =>
    api.post("/maps/directions", { origin, destination, mode }),

  findNearby: (userLocation: { lat: number; lng: number }, maxDistanceKm = 10, category?: string, limit = 10) =>
    api.post("/maps/nearby", { user_location: userLocation, max_distance_km: maxDistanceKm, category, limit }),

  calculateDistance: (originLat: number, originLng: number, destLat: number, destLng: number) =>
    api.get("/maps/distance", { params: { origin_lat: originLat, origin_lng: originLng, dest_lat: destLat, dest_lng: destLng } }),

  getTravelTime: (serviceId: string, userLat: number, userLng: number, mode = "driving") =>
    api.get(`/maps/travel-time/${serviceId}`, { params: { user_lat: userLat, user_lng: userLng, mode } }),

  geocodeAddress: (address: string) =>
    api.post("/maps/geocode", { address }),

  getServiceCoverage: (serviceId: string, radiusKm = 5) =>
    api.get(`/maps/coverage/${serviceId}`, { params: { radius_km: radiusKm } }),

  optimizeRoute: (origin: { lat: number; lng: number }, destinations: any[]) =>
    api.post("/maps/optimize-route", { origin, destinations }),

  healthCheck: () => api.get("/maps/health"),
};


export default api;