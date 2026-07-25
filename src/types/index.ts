// User types
import type { User, CreateUserPayload, UpdateUserPayload } from "./User";

export type { User, CreateUserPayload, UpdateUserPayload };

export type {
  AppPlatform,
  AppVersion,
  AppVersionCreatePayload,
  AppVersionUpdatePayload,
} from "./AppVersion";

// Authentication types
export type LoginCredentials =
  | { email: string; password: string }
  | { phone_number: string; password: string };

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
  image?: string;
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
export interface QuestionMediaItem {
  id: number | null;
  question_id: number;
  side: "question" | "answer";
  media_url: string;
  media_type: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: number;
  question_text: string;
  answer_text: string;
  difficulty: "easy" | "medium" | "hard";
  category_id: number;
  question_media: QuestionMediaItem[];
  answer_media: QuestionMediaItem[];
  created_at: string;
  updated_at: string;
}

export interface QuestionFormData {
  question_text: string;
  answer_text: string;
  difficulty: "easy" | "medium" | "hard";
  category_id: number;
  question_media: File[];
  answer_media: File[];
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

export interface PaginatedApiResponse<T> {
  data: T[];
  meta: Pagination;
}

export interface ApiResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
