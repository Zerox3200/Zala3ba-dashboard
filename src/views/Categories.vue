<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../stores/auth";
import { useCategoriesStore } from "../stores/categories";
import { useCountriesStore } from "../stores/countries";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";
import type { Category, CategoryFormData } from "../types";
import AppHeader from "../components/AppHeader.vue";
import BaseLayout from "../layouts/BaseLayout.vue";

const router = useRouter();
const { t } = useI18n();
const authStore = useAuthStore();
const categoriesStore = useCategoriesStore();
const countriesStore = useCountriesStore();

const searchQuery = ref<string>("");
const pageSize = ref<number>(10);
const currentPage = ref<number>(1);
const showCreateDialog = ref<boolean>(false);
const showDeleteDialog = ref<boolean>(false);
const editingCategory = ref<Category | null>(null);
const categoryToDelete = ref<Category | null>(null);
const categoryForm = ref<{
  validate: () => Promise<{ valid: boolean }>;
} | null>(null);

const categoryFormData = reactive<CategoryFormData>({
  name: "",
  description: "",
  media: undefined,
  is_full_image: "yes",
  country_id: undefined,
});

const nameRules = [
  (v: string) => !!v || t("categories.validation.nameRequired"),
  (v: string) => v.length >= 2 || t("categories.validation.nameMinLength"),
];

const handleSearch = (): void => {
  currentPage.value = 1;
  fetchCategories();
};

const handlePageChange = (page: number): void => {
  currentPage.value = page;
  fetchCategories();
};

const handlePageSizeChange = (): void => {
  currentPage.value = 1;
  fetchCategories();
};

const fetchCategories = async (): Promise<void> => {
  const params: Record<string, any> = {
    page: currentPage.value,
    pageSize: pageSize.value,
  };

  if (searchQuery.value) {
    params.search = searchQuery.value;
  }

  await categoriesStore.fetchCategories(params);
};

const viewCategory = (category: Category): void => {
  router.push(`/categories/${category.id}/questions`);
};

const editCategory = (category: Category): void => {
  editingCategory.value = category;
  categoryFormData.name = category.name;
  categoryFormData.description = category.description || "";
  categoryFormData.is_full_image = category.is_full_image || "yes";
  categoryFormData.country_id = category.country_id || undefined;
  categoryFormData.media = undefined;
  showCreateDialog.value = true;
};

const deleteCategory = (category: Category): void => {
  categoryToDelete.value = category;
  showDeleteDialog.value = true;
};

const confirmDelete = async (): Promise<void> => {
  try {
    if (!categoryToDelete.value) return;

    const result = await categoriesStore.deleteCategory(
      categoryToDelete.value.id
    );
    if (result.success) {
      closeDeleteDialog();
    }
  } catch (error) {
    console.error("Error deleting category:", error);
  }
};

const handleSubmit = async (): Promise<void> => {
  try {
    if (!categoryForm.value) return;

    const { valid } = await categoryForm.value.validate();
    if (!valid) return;

    let result;
    if (editingCategory.value) {
      result = await categoriesStore.updateCategory(
        editingCategory.value.id,
        categoryFormData
      );
      await fetchCategories();
    } else {
      result = await categoriesStore.createCategory(categoryFormData);
    }

    if (result.success) {
      closeDialog();
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

const resetForm = (): void => {
  categoryFormData.name = "";
  categoryFormData.description = "";
  categoryFormData.media = undefined;
  categoryFormData.country_id = undefined;
};

const openCreateDialog = (): void => {
  resetForm();
  editingCategory.value = null;
  showCreateDialog.value = true;
};

const closeDialog = (): void => {
  showCreateDialog.value = false;
  editingCategory.value = null;
  resetForm();
  categoryToDelete.value = null;
};

const closeDeleteDialog = (): void => {
  showDeleteDialog.value = false;
  categoryToDelete.value = null;
};

const getCountryName = (countryId?: number): string | null => {
  if (!countryId) return null;
  const country = countriesStore.allCountries.find((c) => c.id === countryId);
  return country ? country.name : null;
};

onMounted(() => {
  fetchCategories();
  countriesStore.fetchAllCountries();
});

// Watch for route changes to refresh data
watch(
  () => router.currentRoute.value.path,
  () => {
    if (router.currentRoute.value.path === "/categories") {
      fetchCategories();
    }
  }
);

const showIMage = ref([
  {
    title: t("categories.dialog.yes"),
    value: "yes",
  },
  {
    title: t("categories.dialog.no"),
    value: "no",
  },
]);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
</script>

<template>
  <BaseLayout>
    <template #title>
      {{ t("categories.title") }}
    </template>
    <template #createBtn>
      <v-btn
        color="primary"
        class="custom-btn"
        @click="openCreateDialog"
        prepend-icon="mdi-plus"
      >
        {{ t("categories.addCategory") }}
      </v-btn>
    </template>
    <div>
      <div>
        <v-container fluid class="pa-6">
          <AppHeader
            :title="t('categories.title')"
            :subtitle="t('categories.subtitle')"
          />

          <!-- Search and Filters -->
          <v-card color="white" class="mb-7">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="searchQuery"
                    :label="t('categories.searchPlaceholder')"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    clearable
                    @input="handleSearch"
                    bg-color="white"
                    hide-details="auto"
                    color="primary"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="pageSize"
                    :items="[5, 10, 20, 50]"
                    :label="t('categories.itemsPerPage')"
                    variant="outlined"
                    @update:model-value="handlePageSizeChange"
                    color="primary"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="3" class="text-right">
                  <v-chip color="primary" variant="tonal" class="ma-2">
                    {{ t("categories.total") }}:
                    {{ categoriesStore.pagination.total }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Categories Grid -->
          <v-row>
            <v-col
              v-for="category in categoriesStore.categories"
              :key="category.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="custom-card category-card" elevation="8">
                <v-img
                  v-if="category.media_url"
                  :src="`${API_BASE_URL}/storage/${category.media_url}`"
                  height="200"
                  cover
                  class="category-image"
                />
                <v-img
                  v-else
                  src="https://via.placeholder.com/400x200/FF6B35/FFFFFF?text=Category"
                  height="200"
                  cover
                  class="category-image"
                />

                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-bold mb-2">
                    {{ category.name }} 
                  </h3>
                  <p class="text-body-2 text-grey-darken-1 mb-4">
                    {{ category.description || t("categories.noDescription") }}
                  </p>

                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center" style="gap: 6px; flex-wrap: wrap">
                      <v-chip color="primary" variant="tonal" size="small">
                        {{ t("common.id") }}: {{ category.id }}
                      </v-chip>
                      <v-chip
                        v-if="getCountryName(category.country_id)"
                        color="success"
                        variant="tonal"
                        size="small"
                        prepend-icon="mdi-earth"
                      >
                        {{ getCountryName(category.country_id) }}
                      </v-chip>
                    </div>

                    <div class="d-flex gap-2">
                      <v-btn
                        icon="mdi-eye"
                        size="small"
                        color="info"
                        variant="text"
                        @click="viewCategory(category)"
                        :title="t('categories.viewQuestions')"
                      />
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        color="warning"
                        variant="text"
                        @click="editCategory(category)"
                        :title="t('common.edit')"
                      />
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        variant="text"
                        @click="deleteCategory(category)"
                        :title="t('common.delete')"
                      />
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Loading State -->
          <v-row v-if="categoriesStore.loading">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" size="64" />
              <p class="mt-4 text-h6 text-white">
                {{ t("categories.loading") }}
              </p>
            </v-col>
          </v-row>

          <!-- Empty State -->
          <v-row
            v-if="
              !categoriesStore.loading &&
              categoriesStore.categories.length === 0
            "
          >
            <v-col cols="12" class="text-center">
              <v-card class="custom-card empty-card" elevation="8">
                <v-card-text class="pa-8">
                  <v-icon size="64" color="grey" class="mb-4">
                    mdi-folder-open
                  </v-icon>
                  <h3 class="text-h5 font-weight-bold mb-2">
                    {{ t("categories.emptyTitle") }}
                  </h3>
                  <p class="text-grey-darken-1 mb-4">
                    {{ t("categories.emptySubtitle") }}
                  </p>
                  <v-btn
                    color="primary"
                    class="custom-btn"
                    @click="openCreateDialog"
                    prepend-icon="mdi-plus"
                  >
                    {{ t("categories.createCategory") }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Pagination -->
          <v-row v-if="categoriesStore.pagination.last_page > 1" class="mt-6">
            <v-col cols="12" class="text-center">
              <v-pagination
                v-model="currentPage"
                :length="categoriesStore.pagination.last_page"
                :total-visible="7"
                @update:model-value="handlePageChange"
                color="primary"
              />
            </v-col>
          </v-row>
        </v-container>
      </div>
      <!-- Create/Edit Dialog -->
      <v-dialog v-model="showCreateDialog" max-width="600">
        <v-card class="custom-card">
          <v-card-title class="pa-6">
            <h2 class="gradient-text text-h4">
              {{
                editingCategory
                  ? t("categories.dialog.editTitle")
                  : t("categories.dialog.createTitle")
              }}
            </h2>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleSubmit" ref="categoryForm">
              <v-text-field
                v-model="categoryFormData.name"
                :label="t('categories.dialog.name')"
                variant="outlined"
                :rules="nameRules"
                required
              />

              <v-textarea
                v-model="categoryFormData.description"
                :label="t('categories.dialog.description')"
                variant="outlined"
                rows="3"
              />

              <v-file-input
                v-model="categoryFormData.media"
                :label="t('categories.dialog.media')"
                variant="outlined"
                accept="image/*,video/*"
                prepend-icon="mdi-camera"
              />

              <v-select
                v-model="categoryFormData.country_id"
                :label="t('categories.dialog.country')"
                :items="countriesStore.allCountries"
                item-title="name"
                item-value="id"
                variant="outlined"
                clearable
              />

              <v-select
                v-model="categoryFormData.is_full_image"
                :label="t('categories.dialog.fullImage')"
                :items="showIMage"
              />

              <div class="d-flex" style="gap: 12px; flex-wrap: wrap">
                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  :loading="categoriesStore.loading"
                  :disabled="categoriesStore.loading"
                >
                  <v-icon left>
                    {{ editingCategory ? "mdi-content-save" : "mdi-plus" }}
                  </v-icon>
                  {{
                    editingCategory
                      ? t("categories.dialog.updateButton")
                      : t("categories.dialog.createButton")
                  }}
                </v-btn>

                <v-btn color="grey" variant="outlined" @click="closeDialog">
                  {{ t("categories.dialog.cancel") }}
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
              {{ t("categories.dialog.deleteTitle") }}
            </h3>
          </v-card-title>

          <v-card-text class="pa-6">
            <p>
              {{
                t("categories.dialog.deleteConfirm", {
                  name: categoryToDelete ? categoryToDelete.name : "",
                })
              }}
            </p>
            <p class="text-caption text-grey-darken-1 mt-2">
              {{ t("categories.dialog.deleteWarning") }}
            </p>
          </v-card-text>

          <v-card-actions class="pa-6 pt-0">
            <v-btn
              color="error"
              variant="outlined"
              @click="confirmDelete"
              :loading="categoriesStore.loading"
              block
            >
              {{ t("categories.dialog.deleteButton") }}
            </v-btn>
            <v-btn color="grey" variant="text" @click="closeDeleteDialog" block>
              {{ t("categories.dialog.cancel") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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

.category-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.category-image {
  border-radius: 8px 8px 0 0;
}

.empty-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}

.custom-search {
  background: rgba(255, 255, 255, 0.9) !important;
  border-radius: 8px;
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
