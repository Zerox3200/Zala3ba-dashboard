import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type {
  Category,
  CategoryFormData,
  Pagination,
  ApiResponse,
  ApiResult,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref<Category[]>([]);
  const loading = ref<boolean>(false);
  const pagination = ref<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const fetchCategories = async (
    params: Record<string, any> = {}
  ): Promise<ApiResult> => {
    loading.value = true;
    try {
      const response = await axios.get<ApiResponse<Category>>(
        `${API_BASE_URL}/api/categories`,
        { params }
      );
      categories.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      };
      return { success: true };
    } catch (error: any) {
      console.error("خطأ في جلب الفئات:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في جلب الفئات",
      };
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (
    categoryData: CategoryFormData
  ): Promise<ApiResult<Category>> => {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append("name", categoryData.name);
      formData.append("description", categoryData.description || "");
      formData.append("is_full_image", categoryData.is_full_image || "yes");
      if (categoryData.country_id != null) {
        formData.append("country_id", String(categoryData.country_id));
      }
      if (categoryData.media) {
        formData.append("media", categoryData.media);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/categories`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchCategories();
      return { success: true, data: response.data.category };
    } catch (error: any) {
      console.error("خطأ في إنشاء الفئة:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في إنشاء الفئة",
      };
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (
    id: number,
    categoryData: CategoryFormData
  ): Promise<ApiResult<Category>> => {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append("name", categoryData.name);
      formData.append("description", categoryData.description || "");
      formData.append("is_full_image", categoryData.is_full_image || "yes");
      formData.append("country_id", categoryData.country_id != null ? String(categoryData.country_id) : "");
      if (categoryData.media) {
        formData.append("media", categoryData.media);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/categories/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return { success: true, data: response.data.category };
    } catch (error: any) {
      console.error("خطأ في تحديث الفئة:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحديث الفئة",
      };
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: number): Promise<ApiResult> => {
    loading.value = true;
    try {
      await axios.delete(`${API_BASE_URL}/api/categories/${id}`);
      await fetchCategories();
      return { success: true };
    } catch (error: any) {
      console.error("خطأ في حذف الفئة:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في حذف الفئة",
      };
    } finally {
      loading.value = false;
    }
  };

  const getCategory = async (id: number): Promise<ApiResult<Category>> => {
    loading.value = true;
    try {
      const response = await axios.get<Category>(
        `${API_BASE_URL}/api/categories/${id}`
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("خطأ في جلب الفئة:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في جلب الفئة",
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    loading,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
  };
});
