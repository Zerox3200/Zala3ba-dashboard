// User types
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Country types
export interface Country {
  id: number;
  name: string;
  media_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CountryFormData {
  name: string;
  image?: File;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  media_url?: string;
  created_at: string;
  updated_at: string;
  is_full_image: "yes" | "no";
  country_id?: number;
  country?: Country;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  media?: File;
  is_full_image: "yes" | "no";
  country_id?: number;
}

// Question types
export interface Question {
  id: number;
  question_text: string;
  answer_text: string;
  difficulty: "easy" | "medium" | "hard";
  category_id: number;
  question_media_url?: string;
  question_media_type?: string;
  answer_media_url?: string;
  answer_media_type?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionFormData {
  question_text: string;
  answer_text: string;
  difficulty: "easy" | "medium" | "hard";
  category_id: number;
  question_media?: File;
  answer_media?: File;
}

// Pagination types
export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
