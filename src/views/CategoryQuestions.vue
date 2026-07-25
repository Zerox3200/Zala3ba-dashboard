<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useCategoriesStore } from "../stores/categories";
import { useQuestionsStore } from "../stores/questions";
import { Category, Question, QuestionMediaItem } from "../types";
import type { VForm } from "vuetify/lib/components/VForm";
import AppHeader from "../components/AppHeader.vue";
import FormattedDate from "../components/FormattedDate.vue";
import BaseLayout from "../layouts/BaseLayout.vue";
import { mediaUrl } from "../utils/mediaUrl";

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
  question_media: [] as File[],
  answer_media: [] as File[],
});

const resetMediaFields = () => {
  questionFormData.question_media = [];
  questionFormData.answer_media = [];
};

const normalizeFiles = (files: File | File[] | null | undefined): File[] => {
  if (!files) return [];
  if (Array.isArray(files)) {
    return files.filter((file): file is File => file instanceof File);
  }
  return files instanceof File ? [files] : [];
};

const onQuestionMediaChange = (files: File | File[] | null) => {
  questionFormData.question_media = normalizeFiles(files);
};

const onAnswerMediaChange = (files: File | File[] | null) => {
  questionFormData.answer_media = normalizeFiles(files);
};

const formErrorMessage = ref("");
const formFieldErrors = ref<Record<string, string>>({});

const clearFormErrors = () => {
  formErrorMessage.value = "";
  formFieldErrors.value = {};
};

const setFormApiErrors = (result: { message?: string; data?: any }) => {
  clearFormErrors();
  formErrorMessage.value = result.message || t("questions.errors.generic");
  const errors = result.data?.errors as Record<string, string[]> | undefined;
  if (errors) {
    for (const [field, messages] of Object.entries(errors)) {
      if (messages?.length) {
        formFieldErrors.value[field] = messages[0];
      }
    }
  }
};

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
  resetMediaFields();
  clearFormErrors();
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

    clearFormErrors();

    const payload = {
      question_text: questionFormData.question_text,
      answer_text: questionFormData.answer_text,
      difficulty: questionFormData.difficulty,
      category_id: questionFormData.category_id,
      question_media: normalizeFiles(questionFormData.question_media),
      answer_media: normalizeFiles(questionFormData.answer_media),
    };

    let result;
    if (editingQuestion.value) {
      result = await questionsStore.updateQuestion(
        editingQuestion.value.id,
        payload
      );
    } else {
      result = await questionsStore.createQuestion(payload);
    }

    if (result.success) {
      closeDialog();
    } else {
      setFormApiErrors(result);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    formErrorMessage.value = t("questions.errors.generic");
  }
};

const closeDialog = () => {
  showCreateDialog.value = false;
  editingQuestion.value = null;
  questionFormData.question_text = "";
  questionFormData.answer_text = "";
  questionFormData.difficulty = "medium";
  resetMediaFields();
  clearFormErrors();
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
  resetMediaFields();
  clearFormErrors();
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

const isImage = (mimeType?: string | null) => {
  return !!mimeType && mimeType.startsWith("image/");
};

const isVideo = (mimeType?: string | null) => {
  return !!mimeType && mimeType.startsWith("video/");
};

const isAudio = (mimeType?: string | null) => {
  return !!mimeType && mimeType.startsWith("audio/");
};

const sortedMedia = (items?: QuestionMediaItem[] | null) => {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
};

const hasQuestionMedia = (question: Question) =>
  sortedMedia(question.question_media).length > 0;

const hasAnswerMedia = (question: Question) =>
  sortedMedia(question.answer_media).length > 0;

const previewMedia = ref<QuestionMediaItem | null>(null);
const showMediaPreview = ref(false);

const openMediaPreview = (media: QuestionMediaItem) => {
  previewMedia.value = media;
  showMediaPreview.value = true;
};

const closeMediaPreview = () => {
  showMediaPreview.value = false;
  previewMedia.value = null;
};

onMounted(async () => {
  await fetchCategory();
  await fetchQuestions();
});
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
                      <div v-if="question.created_at" class="mt-3">
                        <span
                          class="text-caption text-medium-emphasis d-block mb-1"
                        >
                          {{ t("common.createdAt") }}
                        </span>
                        <FormattedDate :value="question.created_at" />
                      </div>
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

                  <!-- Media galleries -->
                  <div class="media-section mt-5">
                    <v-row dense>
                      <v-col cols="12" md="6">
                        <div class="media-panel">
                          <div class="media-panel__header">
                            <div class="d-flex align-center ga-2">
                              <v-avatar
                                color="primary"
                                variant="tonal"
                                size="32"
                              >
                                <v-icon size="18">mdi-help-circle-outline</v-icon>
                              </v-avatar>
                              <div>
                                <p class="media-panel__title mb-0">
                                  {{ t("questions.questionMedia") }}
                                </p>
                                <p class="media-panel__subtitle mb-0">
                                  {{
                                    t("questions.mediaCount", {
                                      count: sortedMedia(question.question_media)
                                        .length,
                                    })
                                  }}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div
                            v-if="hasQuestionMedia(question)"
                            class="media-grid"
                          >
                            <button
                              v-for="(media, index) in sortedMedia(
                                question.question_media
                              )"
                              :key="`q-${question.id}-${media.id ?? index}`"
                              type="button"
                              class="media-tile"
                              @click="openMediaPreview(media)"
                            >
                              <img
                                v-if="isImage(media.media_type)"
                                :src="mediaUrl(media.media_url)"
                                :alt="`question-media-${media.order || index + 1}`"
                                class="media-tile__image"
                                loading="lazy"
                              />
                              <video
                                v-else-if="isVideo(media.media_type)"
                                :src="mediaUrl(media.media_url)"
                                class="media-tile__image"
                                muted
                              />
                              <div v-else class="media-tile__fallback">
                                <v-icon size="28" color="grey">
                                  {{
                                    isAudio(media.media_type)
                                      ? "mdi-music"
                                      : "mdi-file"
                                  }}
                                </v-icon>
                              </div>
                              <div class="media-tile__overlay">
                                <v-icon color="white" size="22">
                                  mdi-magnify-plus-outline
                                </v-icon>
                              </div>
                              <span class="media-tile__badge">
                                {{ media.order || index + 1 }}
                              </span>
                            </button>
                          </div>

                          <div v-else class="media-empty">
                            <v-icon size="28" color="grey-lighten-1">
                              mdi-file-cancel-outline
                            </v-icon>
                            <span>{{ t("questions.noMedia") }}</span>
                          </div>
                        </div>
                      </v-col>

                      <v-col cols="12" md="6">
                        <div class="media-panel">
                          <div class="media-panel__header">
                            <div class="d-flex align-center ga-2">
                              <v-avatar
                                color="success"
                                variant="tonal"
                                size="32"
                              >
                                <v-icon size="18">mdi-check-circle-outline</v-icon>
                              </v-avatar>
                              <div>
                                <p class="media-panel__title mb-0">
                                  {{ t("questions.answerMedia") }}
                                </p>
                                <p class="media-panel__subtitle mb-0">
                                  {{
                                    t("questions.mediaCount", {
                                      count: sortedMedia(question.answer_media)
                                        .length,
                                    })
                                  }}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div
                            v-if="hasAnswerMedia(question)"
                            class="media-grid"
                          >
                            <button
                              v-for="(media, index) in sortedMedia(
                                question.answer_media
                              )"
                              :key="`a-${question.id}-${media.id ?? index}`"
                              type="button"
                              class="media-tile"
                              @click="openMediaPreview(media)"
                            >
                              <img
                                v-if="isImage(media.media_type)"
                                :src="mediaUrl(media.media_url)"
                                :alt="`answer-media-${media.order || index + 1}`"
                                class="media-tile__image"
                                loading="lazy"
                              />
                              <video
                                v-else-if="isVideo(media.media_type)"
                                :src="mediaUrl(media.media_url)"
                                class="media-tile__image"
                                muted
                              />
                              <div v-else class="media-tile__fallback">
                                <v-icon size="28" color="grey">
                                  {{
                                    isAudio(media.media_type)
                                      ? "mdi-music"
                                      : "mdi-file"
                                  }}
                                </v-icon>
                              </div>
                              <div class="media-tile__overlay">
                                <v-icon color="white" size="22">
                                  mdi-magnify-plus-outline
                                </v-icon>
                              </div>
                              <span class="media-tile__badge">
                                {{ media.order || index + 1 }}
                              </span>
                            </button>
                          </div>

                          <div v-else class="media-empty">
                            <v-icon size="28" color="grey-lighten-1">
                              mdi-file-cancel-outline
                            </v-icon>
                            <span>{{ t("questions.noMedia") }}</span>
                          </div>
                        </div>
                      </v-col>
                    </v-row>
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
              <v-alert
                v-if="formErrorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                border="start"
                closable
                @click:close="formErrorMessage = ''"
              >
                {{ formErrorMessage }}
              </v-alert>

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
                  :model-value="questionFormData.question_media"
                  :label="t('questions.dialog.questionMedia')"
                  :hint="t('questions.dialog.mediaMultipleHint')"
                  :error-messages="
                    formFieldErrors.question_media
                      ? [formFieldErrors.question_media]
                      : []
                  "
                  persistent-hint
                  variant="outlined"
                  accept="image/*"
                  prepend-icon="mdi-image-multiple"
                  multiple
                  chips
                  counter
                  show-size
                  class="mb-4"
                  @update:model-value="onQuestionMediaChange"
                />

                <v-file-input
                  :model-value="questionFormData.answer_media"
                  :label="t('questions.dialog.answerMedia')"
                  :hint="t('questions.dialog.mediaMultipleHint')"
                  :error-messages="
                    formFieldErrors.answer_media
                      ? [formFieldErrors.answer_media]
                      : []
                  "
                  persistent-hint
                  variant="outlined"
                  accept="image/*"
                  prepend-icon="mdi-image-multiple"
                  multiple
                  chips
                  counter
                  show-size
                  class="mb-6"
                  @update:model-value="onAnswerMediaChange"
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

        <!-- Media lightbox -->
        <v-dialog
          v-model="showMediaPreview"
          max-width="920"
          scrim="rgba(15, 15, 20, 0.72)"
        >
          <v-card v-if="previewMedia" class="media-lightbox" rounded="lg">
            <div class="media-lightbox__toolbar">
              <div>
                <p class="text-subtitle-1 font-weight-bold mb-0 text-white">
                  {{
                    previewMedia.side === "answer"
                      ? t("questions.answerMedia")
                      : t("questions.questionMedia")
                  }}
                </p>
                <p class="text-caption mb-0 media-lightbox__meta">
                  #{{ previewMedia.order }} · {{ previewMedia.media_type }}
                </p>
              </div>
              <div class="d-flex ga-1">
                <v-btn
                  icon
                  variant="text"
                  color="white"
                  :href="mediaUrl(previewMedia.media_url)"
                  target="_blank"
                  :title="t('questions.viewFile')"
                >
                  <v-icon>mdi-open-in-new</v-icon>
                </v-btn>
                <v-btn
                  icon
                  variant="text"
                  color="white"
                  @click="closeMediaPreview"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>

            <div class="media-lightbox__body">
              <img
                v-if="isImage(previewMedia.media_type)"
                :src="mediaUrl(previewMedia.media_url)"
                :alt="previewMedia.media_url"
                class="media-lightbox__image"
              />
              <video
                v-else-if="isVideo(previewMedia.media_type)"
                :src="mediaUrl(previewMedia.media_url)"
                controls
                class="media-lightbox__video"
              />
              <audio
                v-else-if="isAudio(previewMedia.media_type)"
                controls
                class="ma-8"
              >
                <source
                  :src="mediaUrl(previewMedia.media_url)"
                  :type="previewMedia.media_type"
                />
              </audio>
              <v-btn
                v-else
                :href="mediaUrl(previewMedia.media_url)"
                target="_blank"
                color="primary"
                class="ma-8"
                prepend-icon="mdi-download"
              >
                {{ t("questions.viewFile") }}
              </v-btn>
            </div>
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

.media-section {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 16px;
}

.media-panel {
  background: #f7f7f8;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 14px;
  height: 100%;
}

.media-panel__header {
  margin-bottom: 12px;
}

.media-panel__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.82);
  line-height: 1.2;
}

.media-panel__subtitle {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 10px;
}

.media-tile {
  position: relative;
  aspect-ratio: 1;
  border: none;
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #e9e9ec;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.media-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(214, 40, 40, 0.18);
}

.media-tile:hover .media-tile__overlay {
  opacity: 1;
}

.media-tile__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-tile__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ececef;
}

.media-tile__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 53, 0.55),
    rgba(214, 40, 40, 0.65)
  );
  opacity: 0;
  transition: opacity 0.2s ease;
}

.media-tile__badge {
  position: absolute;
  top: 6px;
  left: 6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.62);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.media-empty {
  min-height: 104px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.55);
}

.media-lightbox {
  overflow: hidden;
  background: #111;
}

.media-lightbox__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #ff6b35 0%, #d62828 100%);
}

.media-lightbox__meta {
  color: rgba(255, 255, 255, 0.85);
}

.media-lightbox__body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  background: #0f0f12;
}

.media-lightbox__image,
.media-lightbox__video {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.media-lightbox__video {
  outline: none;
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
