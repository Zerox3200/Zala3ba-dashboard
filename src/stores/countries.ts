import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type {
  Country,
  CountryFormData,
  Pagination,
  ApiResponse,
  ApiResult,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useCountriesStore = defineStore("countries", () => {
  const countries = ref<Country[]>([]);
  const allCountries = ref<Country[]>([]);
  const loading = ref<boolean>(false);
  const pagination = ref<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const fetchCountries = async (
    params: Record<string, any> = {}
  ): Promise<ApiResult> => {
    loading.value = true;
    try {
      const response = await axios.get<ApiResponse<Country>>(
        `${API_BASE_URL}/api/countries`,
        { params }
      );
      countries.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      };
      return { success: true };
    } catch (error: any) {
      console.error("Error fetching countries:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch countries",
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchAllCountries = async (): Promise<ApiResult> => {
    try {
      const response = await axios.get<ApiResponse<Country>>(
        `${API_BASE_URL}/api/countries`,
        { params: { all: true } }
      );
      allCountries.value = response.data.data;
      return { success: true };
    } catch (error: any) {
      console.error("Error fetching all countries:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch countries",
      };
    }
  };

  const createCountry = async (
    countryData: CountryFormData
  ): Promise<ApiResult<Country>> => {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append("name", countryData.name);
      if (countryData.image) {
        formData.append("image", countryData.image);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/countries`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchCountries();
      return { success: true, data: response.data.country };
    } catch (error: any) {
      console.error("Error creating country:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create country",
      };
    } finally {
      loading.value = false;
    }
  };

  const updateCountry = async (
    id: number,
    countryData: CountryFormData
  ): Promise<ApiResult<Country>> => {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", countryData.name);
      if (countryData.image) {
        formData.append("image", countryData.image);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/countries/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return { success: true, data: response.data.country };
    } catch (error: any) {
      console.error("Error updating country:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update country",
      };
    } finally {
      loading.value = false;
    }
  };

  const deleteCountry = async (id: number): Promise<ApiResult> => {
    loading.value = true;
    try {
      await axios.delete(`${API_BASE_URL}/api/countries/${id}`);
      await fetchCountries();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting country:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete country",
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    countries,
    allCountries,
    loading,
    pagination,
    fetchCountries,
    fetchAllCountries,
    createCountry,
    updateCountry,
    deleteCountry,
  };
});
