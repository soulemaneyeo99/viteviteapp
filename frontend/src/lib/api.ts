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

  getAll: (params?: { skip?: number; limit?: number; status?: string; service_id?: string }) =>
    api.get("/tickets", { params }), // Fixed: was /admin/tickets

  getPending: () => api.get("/tickets/pending-validation"),

  updateStatus: (ticketId: string, status: string) =>
    api.put(`/tickets/${ticketId}/status`, { status }), // Adjusted if needed, or check backend

  validate: (ticketId: string, action: string) =>
    api.post(`/tickets/${ticketId}/validate`, {}, { params: { action } }),

  createWalkIn: (data: { service_id: string; sub_service_id?: string; user_name: string; user_phone: string; notes?: string }) =>
    api.post("/tickets", { ...data, status: "pending_validation" }), // Use standard create endpoint but maybe with specific status? 
  // Actually, create_ticket in backend sets status to PENDING_VALIDATION by default.
  // So we can just use the standard create endpoint or a specific one if we want to bypass validation?
  // The previous code used /admin/create-ticket which doesn't exist.
  // Let's use /tickets and let the backend handle it.
  // Wait, the backend create_ticket sets status to PENDING_VALIDATION.
  // If admin creates it, maybe it should be auto-validated?
  // For now, let's point to /tickets.
};

export const predictionsAPI = {
  predict: (serviceId: string) => api.post(`/predictions/${serviceId}`),
};

export const chatAPI = {
  sendMessage: (message: string, history?: any[], context?: any) =>
    api.post("/chat", { message, history, context }),
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
  getNearbyServices: (lat: number, lng: number, type: string = 'all') =>
    api.get(`/maps/nearby?lat=${lat}&lng=${lng}&type=${type}`),

  getDirections: (origin: string, destination: string, mode: string = 'driving') =>
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

export const pharmacyAPI = {
  getAll: (params?: any) => api.get("/pharmacies", { params }),
  getStock: (pharmacyId: number, params?: any) => api.get(`/pharmacies/${pharmacyId}/stock`, { params }),
  getAlternatives: (medicine: string, dosage: string, context?: string) =>
    api.get(`/pharmacies/medicines/alternatives?medicine_name=${medicine}&dosage=${dosage}&context=${context || ''}`),
  createOrder: (data: any) => api.post("/pharmacies/orders", data),
};

export const transportAPI = {
  getCompanies: () => api.get("/transport/companies"),
  searchDepartures: (origin: string, destination: string, date?: string) =>
    api.get("/transport/departures", { params: { origin, destination, date } }),
  createBooking: (data: any) => api.post("/transport/bookings", data),
  getSotraLines: () => api.get("/transport/sotra/lines"),
  getLineRealtime: (lineId: number) => api.get(`/transport/sotra/lines/${lineId}/realtime`),
  getStopArrivals: (stopId: number) => api.get(`/transport/sotra/stops/${stopId}/arrivals`),
};

export const administrationsAPI = {
  getAll: (params?: { type?: string; is_open?: boolean; search?: string; limit?: number; offset?: number }) =>
    api.get("/administrations", { params }),

  getById: (id: string) => api.get(`/administrations/${id}`),

  getServices: (id: string) => api.get(`/administrations/${id}/services`),

  getQueueStatus: (id: string) => api.get(`/administrations/${id}/queue-status`),

  create: (data: any) => api.post("/administrations", data),

  update: (id: string, data: any) => api.put(`/administrations/${id}`, data),

  delete: (id: string) => api.delete(`/administrations/${id}`),
};

export const adminDashboardAPI = {
  getOverview: (serviceId?: string) =>
    api.get("/admin/dashboard/stats", { params: { service_id: serviceId } }), // Fixed: was /admin/dashboard/overview

  createWalkInTicket: (data: { service_id: string; user_name?: string; user_phone?: string; notes?: string; priority?: number }) =>
    api.post("/tickets", data), // Use standard ticket creation

  callNextTicket: (serviceId: string) =>
    api.post(`/tickets/call-next/${serviceId}`), // Fixed: was /admin/dashboard/call-next

  completeTicket: (ticketId: string, notes?: string) =>
    api.post(`/tickets/${ticketId}/complete`, { notes }), // Fixed: was /admin/dashboard/complete

  getDailyStats: (serviceId?: string, date?: string) =>
    api.get("/admin/dashboard/stats", { params: { service_id: serviceId, date } }), // Reuse stats endpoint

  getAgentPerformance: (date?: string) =>
    api.get("/admin/dashboard/stats", { params: { date } }), // Reuse stats endpoint for now
};

export default api;