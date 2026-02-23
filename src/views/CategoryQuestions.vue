<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useCategoriesStore } from "../stores/categories";
import { useQuestionsStore } from "../stores/questions";
import { Category, Question } from "../types";
import type { VForm } from "vuetify/lib/components/VForm";
import AppHeader from "../components/AppHeader.vue";
import BaseLayout from "../layouts/BaseLayout.vue";

const route = useRoute();
const { t } = useI18n();
const categoriesStore = useCategoriesStore();
const questionsStore = useQuestionsStore();

const difficultyFilter = ref("");
const pageSize = ref(10);
const currentPage = ref(1);
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const editingQuestion = ref<Question | null>(null);
const questionToDelete = ref<Question | null>(null);
const questionForm = ref<VForm | null>(null);

const category = ref<Category | null>(null);

const questionFormData = reactive({
  question_text: "",
  answer_text: "",
  difficulty: "medium" as "medium" | "easy" | "hard",
  category_id: +route.params.id,
  question_media: undefined as File | undefined,
  answer_media: undefined as File | undefined,
});

const difficultyOptions = [
  { title: t("questions.difficulty.easy"), value: "easy" },
  { title: t("questions.difficulty.medium"), value: "medium" },
  { title: t("questions.difficulty.hard"), value: "hard" },
];

const questionTextRules = [
  (v: string) => !!v || t("questions.validation.questionRequired"),
  (v: string) => v.length >= 5 || "Question must be at least 5 characters",
];

const answerTextRules = [
  (v: string) => !!v || t("questions.validation.answerRequired"),
  (v: string) => v.length >= 2 || "Answer must be at least 2 characters",
];

const difficultyRules = [
  (v: string) => !!v || t("questions.validation.difficultyRequired"),
];

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchQuestions();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchQuestions();
};

const handlePageSizeChange = () => {
  currentPage.value = 1;
  fetchQuestions();
};

const fetchQuestions = async () => {
  const params: Record<string, any> = {
    page: currentPage.value,
    per_page: pageSize.value,
    category_id: route.params.id,
  };

  if (difficultyFilter.value) {
    params.difficulty = difficultyFilter.value;
  }

  await questionsStore.fetchQuestions(params);
};

const fetchCategory = async () => {
  const result = await categoriesStore.getCategory(+route.params.id);
  if (result.success) {
    category.value = result.data || null;
  }
};

const viewQuestion = (question: Question) => {
  // Could implement a detailed view dialog
  console.log("View question:", question);
};

const editQuestion = (question: Question) => {
  editingQuestion.value = question;
  questionFormData.question_text = question.question_text;
  questionFormData.answer_text = question.answer_text;
  questionFormData.difficulty = question.difficulty;
  questionFormData.question_media = undefined;
  questionFormData.answer_media = undefined;
  showCreateDialog.value = true;
};

const deleteQuestion = (question: Question) => {
  questionToDelete.value = question;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!questionToDelete.value) return;

  const result = await questionsStore.deleteQuestion(
    questionToDelete.value.id,
    +route.params.id
  );
  if (result.success) {
    showDeleteDialog.value = false;
    questionToDelete.value = null;
  }
};

const handleSubmit = async () => {
  try {
    if (!questionForm.value) return;

    const { valid } = await questionForm.value.validate();
    if (!valid) return;

    let result;
    if (editingQuestion.value) {
      result = await questionsStore.updateQuestion(
        editingQuestion.value.id,
        questionFormData
      );
    } else {
      result = await questionsStore.createQuestion(questionFormData);
    }

    if (result.success) {
      closeDialog();
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

const closeDialog = () => {
  showCreateDialog.value = false;
  editingQuestion.value = null;
  questionFormData.question_text = "";
  questionFormData.answer_text = "";
  questionFormData.difficulty = "medium";
  questionFormData.question_media = undefined;
  questionFormData.answer_media = undefined;
};

const closeDeleteDialog = () => {
  showDeleteDialog.value = false;
  questionToDelete.value = null;
};

const openCreateDialog = () => {
  editingQuestion.value = null;
  questionFormData.question_text = "";
  questionFormData.answer_text = "";
  questionFormData.difficulty = "medium";
  questionFormData.question_media = undefined;
  questionFormData.answer_media = undefined;
  showCreateDialog.value = true;
};

const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
  switch (difficulty) {
    case "easy":
      return "success";
    case "medium":
      return "warning";
    case "hard":
      return "error";
    default:
      return "primary";
  }
};

const isImage = (mimeType?: string) => {
  return mimeType && mimeType.startsWith("image/");
};

const isVideo = (mimeType?: string) => {
  return mimeType && mimeType.startsWith("video/");
};

const isAudio = (mimeType?: string) => {
  return mimeType && mimeType.startsWith("audio/");
};

onMounted(async () => {
  await fetchCategory();
  await fetchQuestions();
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
</script>

<template>
  <BaseLayout>
    <template #title>
      {{ t("questions.title") }} -
      {{ category?.name || t("common.category") }}
    </template>
    <template #createBtn>
      <v-btn
        color="primary"
        class="custom-btn"
        @click="openCreateDialog"
        prepend-icon="mdi-plus"
      >
        {{ t("questions.addQuestion") }}
      </v-btn>
    </template>
    <div>
      <div>
        <v-container fluid class="pa-6">
          <AppHeader
            :title="category?.name || t('questions.categoryQuestions')"
            :subtitle="category?.description"
          />

          <!-- Filters -->
          <v-card class="mb-7">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="difficultyFilter"
                    :items="difficultyOptions"
                    :label="t('questions.filterByDifficulty')"
                    variant="outlined"
                    clearable
                    @update:model-value="handleFilterChange"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="pageSize"
                    :items="[5, 10, 20, 50]"
                    :label="t('questions.itemsPerPageLabel')"
                    variant="outlined"
                    @update:model-value="handlePageSizeChange"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="5" class="text-right">
                  <v-chip color="primary" variant="tonal" class="ma-2">
                    {{ t("questions.totalQuestions") }}:
                    {{ questionsStore.pagination.total }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Questions List -->
          <v-row>
            <v-col
              v-for="question in questionsStore.questions"
              :key="question.id"
              cols="12"
            >
              <v-card class="custom-card question-card" elevation="8">
                <v-card-text class="pa-6">
                  <div class="d-flex justify-space-between align-start mb-4">
                    <div class="flex-grow-1">
                      <h3 class="text-h6 font-weight-bold mb-2">
                        {{ question.question_text }}
                      </h3>
                      <p class="text-body-2 text-grey-darken-1">
                        <strong>{{ t("questions.answer") }}:</strong>
                        {{ question.answer_text }}
                      </p>
                    </div>

                    <div class="d-flex flex-column align-end gap-2">
                      <v-chip
                        :color="getDifficultyColor(question.difficulty)"
                        variant="tonal"
                        size="small"
                      >
                        {{ question.difficulty }}
                      </v-chip>

                      <div class="d-flex gap-1">
                        <v-btn
                          icon="mdi-eye"
                          size="small"
                          color="info"
                          variant="text"
                          @click="viewQuestion(question)"
                          :title="t('questions.viewDetails')"
                        />
                        <v-btn
                          icon="mdi-pencil"
                          size="small"
                          color="warning"
                          variant="text"
                          @click="editQuestion(question)"
                          :title="t('questions.edit')"
                        />
                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          color="error"
                          variant="text"
                          @click="deleteQuestion(question)"
                          :title="t('questions.delete')"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Media Preview -->
                  <div
                    v-if="
                      question.question_media_url || question.answer_media_url
                    "
                    class="mt-4"
                  >
                    <v-divider class="mb-4"></v-divider>

                    <div class="d-flex gap-4">
                      <div
                        v-if="question.question_media_url"
                        class="media-preview"
                      >
                        <h4 class="text-subtitle-2 font-weight-bold mb-2">
                          {{ t("questions.questionMedia") }}
                        </h4>
                        <v-img
                          v-if="isImage(question?.question_media_type)"
                          :src="`${API_BASE_URL}/storage/${question.question_media_url}`"
                          width="150"
                          height="100"
                          cover
                          class="rounded"
                        />
                        <video
                          v-else-if="isVideo(question?.question_media_type)"
                          :src="`${API_BASE_URL}/storage/${question.question_media_url}`"
                          width="150"
                          height="100"
                          controls
                          class="rounded"
                        />
                        <audio
                          v-else-if="isAudio(question?.question_media_type)"
                          controls
                        >
                          <source
                            :src="`${API_BASE_URL}/storage/${question.question_media_url}`"
                            type="audio/mpeg"
                          />
                        </audio>
                        <v-btn
                          v-else
                          :href="`${API_BASE_URL}/storage/${question.question_media_url}`"
                          target="_blank"
                          variant="outlined"
                          size="small"
                        >
                          {{ t("questions.viewFile") }}
                        </v-btn>
                      </div>

                      <div
                        v-if="question.answer_media_url"
                        class="media-preview"
                      >
                        <h4 class="text-subtitle-2 font-weight-bold mb-2">
                          {{ t("questions.answerMedia") }}
                        </h4>
                        <v-img
                          v-if="isImage(question.answer_media_type)"
                          :src="`${API_BASE_URL}/storage/${question.answer_media_url}`"
                          width="150"
                          height="100"
                          cover
                          class="rounded"
                        />
                        <video
                          v-else-if="isVideo(question.answer_media_type)"
                          :src="`${API_BASE_URL}/storage/${question.answer_media_url}`"
                          width="150"
                          height="100"
                          controls
                          class="rounded"
                        />
                        <audio
                          v-else-if="isAudio(question?.answer_media_type)"
                          controls
                        >
                          <source
                            :src="`${API_BASE_URL}/storage/${question.answer_media_url}`"
                            type="audio/mpeg"
                          />
                        </audio>
                        <v-btn
                          v-else
                          :href="`${API_BASE_URL}/storage/${question.answer_media_url}`"
                          target="_blank"
                          variant="outlined"
                          size="small"
                        >
                          {{ t("questions.viewFile") }}
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Loading State -->
          <v-row v-if="questionsStore.loading">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" size="64" />
              <p class="mt-4 text-h6 text-white">
                {{ t("questions.loadingQuestions") }}
              </p>
            </v-col>
          </v-row>

          <!-- Empty State -->
          <v-row
            v-if="
              !questionsStore.loading && questionsStore.questions.length === 0
            "
          >
            <v-col cols="12" class="text-center">
              <v-card class="custom-card empty-card" elevation="8">
                <v-card-text class="pa-8">
                  <v-icon size="64" color="grey" class="mb-4">
                    mdi-help-circle-outline
                  </v-icon>
                  <h3 class="text-h5 font-weight-bold mb-2">
                    {{ t("questions.noQuestionsFound") }}
                  </h3>
                  <p class="text-grey-darken-1 mb-4">
                    {{ t("questions.addFirstQuestion") }}
                  </p>
                  <v-btn
                    color="primary"
                    class="custom-btn"
                    @click="openCreateDialog"
                    prepend-icon="mdi-plus"
                  >
                    {{ t("questions.addQuestionButton") }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Pagination -->
          <v-row v-if="questionsStore.pagination.last_page > 1" class="mt-6">
            <v-col cols="12" class="text-center">
              <v-pagination
                v-model="currentPage"
                :length="questionsStore.pagination.last_page"
                :total-visible="7"
                @update:model-value="handlePageChange"
                color="primary"
              />
            </v-col>
          </v-row>
        </v-container>
      </div>
      <div>
        <!-- Create/Edit Dialog -->
        <v-dialog v-model="showCreateDialog" max-width="800">
          <v-card class="custom-card">
            <v-card-title class="pa-6">
              <h2 class="gradient-text text-h4">
                {{
                  editingQuestion
                    ? t("questions.editQuestion")
                    : t("questions.addNewQuestion")
                }}
              </h2>
            </v-card-title>

            <v-card-text class="pa-6">
              <v-form @submit.prevent="handleSubmit" ref="questionForm">
                <v-textarea
                  v-model="questionFormData.question_text"
                  :label="t('questions.dialog.questionText')"
                  variant="outlined"
                  rows="3"
                  :rules="questionTextRules"
                  required
                  class="mb-4"
                />

                <v-textarea
                  v-model="questionFormData.answer_text"
                  :label="t('questions.dialog.answerText')"
                  variant="outlined"
                  rows="3"
                  :rules="answerTextRules"
                  required
                  class="mb-4"
                />

                <v-select
                  v-model="questionFormData.difficulty"
                  :items="difficultyOptions"
                  :label="t('questions.dialog.difficulty')"
                  variant="outlined"
                  :rules="difficultyRules"
                  required
                  class="mb-4"
                />

                <v-divider class="my-6"></v-divider>

                <h3 class="text-h6 font-weight-bold mb-4">
                  {{ t("questions.mediaFiles") }}
                </h3>

                <v-file-input
                  v-model="questionFormData.question_media"
                  :label="t('questions.dialog.questionMedia')"
                  variant="outlined"
                  accept="image/*,video/*,audio/*,.pdf"
                  prepend-icon="mdi-file-question"
                  class="mb-4"
                />

                <v-file-input
                  v-model="questionFormData.answer_media"
                  :label="t('questions.dialog.answerMedia')"
                  variant="outlined"
                  accept="image/*,video/*,audio/*,.pdf"
                  prepend-icon="mdi-file-check"
                  class="mb-6"
                />

                <div class="d-flex" style="gap: 16px">
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="questionsStore.loading"
                    :disabled="questionsStore.loading"
                    size="50"
                    style="width: calc(50% - 8px)"
                  >
                    <v-icon left>
                      {{ editingQuestion ? "mdi-content-save" : "mdi-plus" }}
                    </v-icon>
                    {{
                      editingQuestion
                        ? t("questions.dialog.updateButton")
                        : t("questions.dialog.createButton")
                    }}
                  </v-btn>

                  <v-btn
                    color="grey"
                    variant="outlined"
                    @click="closeDialog"
                    size="50"
                    style="width: calc(50% - 8px)"
                  >
                    {{ t("questions.dialog.cancel") }}
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="showDeleteDialog" max-width="400">
          <v-card class="custom-card">
            <v-card-title class="pa-6">
              <h3 class="text-h5 font-weight-bold">
                {{ t("questions.dialog.deleteTitle") }}
              </h3>
            </v-card-title>

            <v-card-text class="pa-6">
              <p>{{ t("questions.dialog.deleteConfirm") }}</p>
              <p class="text-caption text-grey-darken-1 mt-2">
                {{ t("questions.dialog.deleteWarning") }}
              </p>
            </v-card-text>

            <v-card-actions class="pa-6 pt-0">
              <v-btn
                color="error"
                variant="outlined"
                @click="confirmDelete"
                :loading="questionsStore.loading"
                block
              >
                {{ t("questions.dialog.deleteButton") }}
              </v-btn>
              <v-btn
                color="grey"
                variant="text"
                @click="closeDeleteDialog"
                block
              >
                {{ t("questions.dialog.cancel") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
.custom-drawer {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}

.custom-app-bar {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}

.custom-main {
  background: linear-gradient(135deg, #ff6b35 0%, #d62828 100%);
}

.header-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}

.question-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.empty-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}

.media-preview {
  flex: 1;
}

.custom-list-item {
  border-radius: 8px;
  margin: 4px 8px;
}

.custom-list-item:hover {
  background-color: rgba(255, 107, 53, 0.1) !important;
}

.lightning-icons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.lightning-icon {
  animation: lightning 2s infinite;
}

@keyframes lightning {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.gradient-text {
  background: linear-gradient(45deg, #ff6b35, #d62828);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
