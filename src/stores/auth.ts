import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ApiResult,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("token") || null);
  const loading = ref<boolean>(false);

  const isAuthenticated = computed(() => !!token.value);

  // تكوين إعدادات axios الافتراضية
  if (token.value) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
  }

  const login = async (credentials: LoginCredentials): Promise<ApiResult> => {
    loading.value = true;
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/login`,
        credentials
      );
      const { user: userData, token: authToken } = response.data;

      user.value = userData;
      token.value = authToken;
      localStorage.setItem("token", authToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      return { success: true };
    } catch (error: any) {
      console.error("خطأ في تسجيل الدخول:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تسجيل الدخول",
      };
    } finally {
      loading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    loading.value = true;
    try {
      if (token.value) {
        await axios.post(`${API_BASE_URL}/api/logout`);
      }
    } catch (error: any) {
      console.error("خطأ في تسجيل الخروج:", error);
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      loading.value = false;
    }
  };

  const register = async (userData: RegisterData): Promise<ApiResult> => {
    loading.value = true;
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/register`,
        userData
      );
      const { user: newUser, token: authToken } = response.data;

      user.value = newUser;
      token.value = authToken;
      localStorage.setItem("token", authToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      return { success: true };
    } catch (error: any) {
      console.error("خطأ في التسجيل:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في التسجيل",
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
  };
});
