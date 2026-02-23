import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import type {
  Question,
  QuestionFormData,
  Pagination,
  ApiResponse,
  ApiResult,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useQuestionsStore = defineStore("questions", () => {
  const questions = ref<Question[]>([]);
  const loading = ref<boolean>(false);
  const pagination = ref<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const fetchQuestions = async (
    params: Record<string, any> = {}
  ): Promise<ApiResult> => {
    loading.value = true;
    try {
      const response = await axios.get<ApiResponse<Question>>(
        `${API_BASE_URL}/api/questions`,
        { params }
      );
      questions.value = response.data.data;
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      };
      return { success: true };
    } catch (error: any) {
      console.error("خطأ في جلب الأسئلة:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في جلب الأسئلة",
      };
    } finally {
      loading.value = false;
    }
  };

  const createQuestion = async (
    questionData: QuestionFormData
  ): Promise<ApiResult<Question>> => {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append("question_text", questionData.question_text);
      formData.append("answer_text", questionData.answer_text);
      formData.append("difficulty", questionData.difficulty);
      formData.append("category_id", questionData.category_id.toString());

      if (questionData.question_media) {
        formData.append("question_media", questionData.question_media);
      }

      if (questionData.answer_media) {
        formData.append("answer_media", questionData.answer_media);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/questions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchQuestions({ category_id: questionData.category_id });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("خطأ في إنشاء السؤال:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في إنشاء السؤال",
      };
    } finally {
      loading.value = false;
    }
  };

  const updateQuestion = async (
    id: number,
    questionData: QuestionFormData
  ): Promise<ApiResult<Question>> => {
    loading.value = true;
    try {
      const formData = new FormData();
      formData.append("question_text", questionData.question_text);
      formData.append("answer_text", questionData.answer_text);
      formData.append("difficulty", questionData.difficulty);
      formData.append("category_id", questionData.category_id.toString());

      if (questionData.question_media) {
        formData.append("question_media", questionData.question_media);
      }

      if (questionData.answer_media) {
        formData.append("answer_media", questionData.answer_media);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/questions/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchQuestions({ category_id: questionData.category_id });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("خطأ في تحديث السؤال:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحديث السؤال",
      };
    } finally {
      loading.value = false;
    }
  };

  const deleteQuestion = async (
    id: number,
    categoryId: number
  ): Promise<ApiResult> => {
    loading.value = true;
    try {
      await axios.delete(`${API_BASE_URL}/api/questions/${id}`);
      await fetchQuestions({ category_id: categoryId });
      return { success: true };
    } catch (error: any) {
      console.error("خطأ في حذف السؤال:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في حذف السؤال",
      };
    } finally {
      loading.value = false;
    }
  };

  const getQuestion = async (id: number): Promise<ApiResult<Question>> => {
    loading.value = true;
    try {
      const response = await axios.get<Question>(
        `${API_BASE_URL}/api/questions/${id}`
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("خطأ في جلب السؤال:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في جلب السؤال",
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    questions,
    loading,
    pagination,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestion,
  };
});
