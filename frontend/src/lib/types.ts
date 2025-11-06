export enum ServiceStatus {
  OPEN = "ouvert",
  CLOSED = "fermé",
  PAUSED = "en_pause"
}

export enum AffluenceLevel {
  LOW = "faible",
  MODERATE = "modérée",
  HIGH = "élevée",
  VERY_HIGH = "très_élevée"
}

export enum TicketStatus {
  WAITING = "en_attente",
  CALLED = "appelé",
  SERVING = "en_service",
  COMPLETED = "terminé",
  CANCELLED = "annulé"
}

export interface Document {
  name: string;
  required: boolean;
  description?: string;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  status: ServiceStatus;
  affluence_level: AffluenceLevel;
  estimated_wait_time: number;
  current_queue_size: number;
  required_documents: Document[];
  opening_hours: string;
  location?: Location;
  icon: string;
}

export interface Ticket {
  id: string;
  service_id: string;
  ticket_number: string;
  user_name?: string;
  user_phone?: string;
  status: TicketStatus;
  created_at: string;
  called_at?: string;
  completed_at?: string;
  estimated_wait_time: number;
  position_in_queue: number;
  notes?: string;
}

export interface TicketCreate {
  service_id: string;
  user_name?: string;
  user_phone?: string;
  notes?: string;
}

export interface AdminStats {
  total_tickets_today: number;
  active_tickets: number;
  completed_tickets: number;
  average_wait_time: number;
  services_open: number;
  busiest_service?: string;
}

export interface AIPrediction {
  service_id: string;
  predicted_wait_time: number;
  confidence: number;
  suggested_affluence: AffluenceLevel;
  recommendation: string;
  best_time_to_visit?: string;
}

export interface ServiceStats {
  service_id: string;
  service_name: string;
  status: ServiceStatus;
  active_tickets: number;
  affluence_level: AffluenceLevel;
  estimated_wait_time: number;
}

export interface DashboardData {
  stats: AdminStats;
  services: Service[];
  service_stats: ServiceStats[];
  recent_tickets: Ticket[];
}