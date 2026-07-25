export interface User {
  id: number;
  name: string;
  email: string;
  country_code?: string | null;
  phone_number?: string | null;
  phone_verified: boolean;
  email_verified: boolean;
  role: string;
  available_games: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  country_code: string;
  phone_number: string;
  role: string;
  available_games: number;
  password: string;
}

export interface UpdateUserPayload {
  available_games: number;
}
