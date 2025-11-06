import { Service, Ticket, TicketCreate, AdminStats, AIPrediction, DashboardData } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Une erreur est survenue' }));
        throw new Error(error.detail || `Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // === SERVICES ===
  async getServices(): Promise<Service[]> {
    return this.request<Service[]>('/api/services');
  }

  async getService(serviceId: string): Promise<Service> {
    return this.request<Service>(`/api/services/${serviceId}`);
  }

  async getServiceQueue(serviceId: string): Promise<any> {
    return this.request(`/api/services/${serviceId}/queue`);
  }

  async updateService(serviceId: string, updates: Partial<Service>): Promise<Service> {
    return this.request<Service>(`/api/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // === TICKETS ===
  async createTicket(ticketData: TicketCreate): Promise<Ticket> {
    return this.request<Ticket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getTicket(ticketId: string): Promise<Ticket> {
    return this.request<Ticket>(`/api/tickets/${ticketId}`);
  }

  async updateTicket(ticketId: string, updates: any): Promise<Ticket> {
    return this.request<Ticket>(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async cancelTicket(ticketId: string): Promise<any> {
    return this.request(`/api/tickets/${ticketId}`, {
      method: 'DELETE',
    });
  }

  async getAllTickets(): Promise<Ticket[]> {
    return this.request<Ticket[]>('/api/tickets');
  }

  // === ADMIN ===
  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/api/admin/stats');
  }

  async getDashboardData(): Promise<DashboardData> {
    return this.request<DashboardData>('/api/admin/dashboard');
  }

  async callNextTicket(serviceId: string): Promise<any> {
    return this.request(`/api/admin/call-next/${serviceId}`, {
      method: 'POST',
    });
  }

  async completeTicket(ticketId: string): Promise<any> {
    return this.request(`/api/admin/complete-ticket/${ticketId}`, {
      method: 'POST',
    });
  }

  // === AI ===
  async predictWaitTime(serviceId: string): Promise<AIPrediction> {
    return this.request<AIPrediction>(`/api/ai/predict/${serviceId}`, {
      method: 'POST',
    });
  }

  async chatbot(message: string, context?: any): Promise<{ response: string }> {
    return this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  // === HEALTH ===
  async healthCheck(): Promise<any> {
    return this.request('/health');
  }
}

export const api = new ApiClient(API_BASE_URL);