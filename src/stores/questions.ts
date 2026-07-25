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

  const toFileList = (value?: File[] | File | null): File[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter((file): file is File => file instanceof File);
    }
    return value instanceof File ? [value] : [];
  };

  const appendQuestionFormData = (
    formData: FormData,
    questionData: QuestionFormData
  ) => {
    formData.append("question_text", questionData.question_text);
    formData.append("answer_text", questionData.answer_text);
    formData.append("difficulty", questionData.difficulty);
    formData.append("category_id", String(questionData.category_id));

    const questionFiles = toFileList(questionData.question_media);
    questionFiles.forEach((file, index) => {
      formData.append(`question_media[${index}]`, file);
    });

    const answerFiles = toFileList(questionData.answer_media);
    answerFiles.forEach((file, index) => {
      formData.append(`answer_media[${index}]`, file);
    });
  };

  const createQuestion = async (
    questionData: QuestionFormData
  ): Promise<ApiResult<Question>> => {
    loading.value = true;
    try {
      const formData = new FormData();
      appendQuestionFormData(formData, questionData);

      // Let the browser set multipart Content-Type with boundary
      const response = await axios.post(
        `${API_BASE_URL}/api/questions`,
        formData
      );

      await fetchQuestions({ category_id: questionData.category_id });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("خطأ في إنشاء السؤال:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في إنشاء السؤال",
        data: error.response?.data,
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
      appendQuestionFormData(formData, questionData);

      // Let the browser set multipart Content-Type with boundary
      const response = await axios.post(
        `${API_BASE_URL}/api/questions/${id}`,
        formData
      );

      await fetchQuestions({ category_id: questionData.category_id });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("خطأ في تحديث السؤال:", error);
      return {
        success: false,
        message: error.response?.data?.message || "فشل في تحديث السؤال",
        data: error.response?.data,
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
