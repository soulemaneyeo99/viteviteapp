export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: "user" | "admin" | "super";
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  tokens: AuthTokens;
  user: User;
}

export type ServiceStatus = "ouvert" | "fermé" | "en_pause";
export type AffluenceLevel = "faible" | "modérée" | "élevée" | "très_élevée";

export interface DocumentRequired {
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
  slug: string;
  category: string;
  description: string;
  icon: string;
  status: ServiceStatus;
  affluence_level: AffluenceLevel;
  estimated_wait_time: number;
  current_queue_size: number;
  required_documents: DocumentRequired[];
  opening_hours: string;
  location?: Location;
  created_at: string;
  updated_at: string;
}

export type TicketStatus = "en_attente" | "appelé" | "en_service" | "terminé" | "annulé";

export interface Ticket {
  id: string;
  service_id: string;
  user_id?: string;
  ticket_number: string;
  position_in_queue: number;
  status: TicketStatus;
  user_name?: string;
  user_phone?: string;
  estimated_wait_time: number;
  called_at?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  success: boolean;
  service_id: string;
  service_name: string;
  predicted_wait_time: number;
  confidence: number;
  recommendation: string;
  best_time_to_visit: string;
  method: string;
  message: string;
}