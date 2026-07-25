<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useCountriesStore } from "../stores/countries";
import type { Country, CountryFormData } from "../types";
import AppHeader from "../components/AppHeader.vue";
import FormattedDate from "../components/FormattedDate.vue";
import BaseLayout from "../layouts/BaseLayout.vue";
import { mediaUrl } from "../utils/mediaUrl";

const { t } = useI18n();
const countriesStore = useCountriesStore();

const searchQuery = ref<string>("");
const pageSize = ref<number>(10);
const currentPage = ref<number>(1);
const showCreateDialog = ref<boolean>(false);
const showDeleteDialog = ref<boolean>(false);
const editingCountry = ref<Country | null>(null);
const countryToDelete = ref<Country | null>(null);
const countryForm = ref<{
  validate: () => Promise<{ valid: boolean }>;
} | null>(null);

const countryFormData = reactive<CountryFormData>({
  name: "",
  image: undefined,
});

const nameRules = [
  (v: string) => !!v || t("countries.validation.nameRequired"),
  (v: string) => v.length >= 2 || t("countries.validation.nameMinLength"),
];

const handleSearch = (): void => {
  currentPage.value = 1;
  fetchCountries();
};

const handlePageChange = (page: number): void => {
  currentPage.value = page;
  fetchCountries();
};

const handlePageSizeChange = (): void => {
  currentPage.value = 1;
  fetchCountries();
};

const fetchCountries = async (): Promise<void> => {
  const params: Record<string, any> = {
    page: currentPage.value,
    pageSize: pageSize.value,
  };

  if (searchQuery.value) {
    params.search = searchQuery.value;
  }

  await countriesStore.fetchCountries(params);
};

const editCountry = (country: Country): void => {
  editingCountry.value = country;
  countryFormData.name = country.name;
  countryFormData.image = undefined;
  showCreateDialog.value = true;
};

const deleteCountry = (country: Country): void => {
  countryToDelete.value = country;
  showDeleteDialog.value = true;
};

const confirmDelete = async (): Promise<void> => {
  try {
    if (!countryToDelete.value) return;

    const result = await countriesStore.deleteCountry(
      countryToDelete.value.id
    );
    if (result.success) {
      closeDeleteDialog();
    }
  } catch (error) {
    console.error("Error deleting country:", error);
  }
};

const handleSubmit = async (): Promise<void> => {
  try {
    if (!countryForm.value) return;

    const { valid } = await countryForm.value.validate();
    if (!valid) return;

    let result;
    if (editingCountry.value) {
      result = await countriesStore.updateCountry(
        editingCountry.value.id,
        countryFormData
      );
      await fetchCountries();
    } else {
      result = await countriesStore.createCountry(countryFormData);
    }

    if (result.success) {
      closeDialog();
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

const resetForm = (): void => {
  countryFormData.name = "";
  countryFormData.image = undefined;
};

const openCreateDialog = (): void => {
  resetForm();
  editingCountry.value = null;
  showCreateDialog.value = true;
};

const closeDialog = (): void => {
  showCreateDialog.value = false;
  editingCountry.value = null;
  resetForm();
};

const closeDeleteDialog = (): void => {
  showDeleteDialog.value = false;
  countryToDelete.value = null;
};

onMounted(() => {
  fetchCountries();
});
</script>

<template>
  <BaseLayout>
    <template #title>
      {{ t("countries.title") }}
    </template>
    <template #createBtn>
      <v-btn
        color="primary"
        class="custom-btn"
        @click="openCreateDialog"
        prepend-icon="mdi-plus"
      >
        {{ t("countries.addCountry") }}
      </v-btn>
    </template>
    <div>
      <div>
        <v-container fluid class="pa-6">
          <AppHeader
            :title="t('countries.title')"
            :subtitle="t('countries.subtitle')"
          />

          <!-- Search and Filters -->
          <v-card color="white" class="mb-7">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="searchQuery"
                    :label="t('countries.searchPlaceholder')"
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
                    :label="t('countries.itemsPerPage')"
                    variant="outlined"
                    @update:model-value="handlePageSizeChange"
                    color="primary"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" md="3" class="text-right">
                  <v-chip color="primary" variant="tonal" class="ma-2">
                    {{ t("countries.total") }}:
                    {{ countriesStore.pagination.total }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Countries Grid -->
          <v-row>
            <v-col
              v-for="country in countriesStore.countries"
              :key="country.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="custom-card country-card" elevation="8">
                <v-img
                  v-if="country.image"
                  :src="mediaUrl(country.image)"
                  height="200"
                  cover
                  class="country-image"
                />
                <v-img
                  v-else
                  src="https://via.placeholder.com/400x200/FF6B35/FFFFFF?text=Country"
                  height="200"
                  cover
                  class="country-image"
                />

                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-bold mb-2">
                    {{ country.name }}
                  </h3>

                  <div v-if="country.created_at" class="mb-4">
                    <span class="text-caption text-medium-emphasis d-block mb-1">
                      {{ t("common.createdAt") }}
                    </span>
                    <FormattedDate :value="country.created_at" />
                  </div>

                  <div class="d-flex justify-space-between align-center">
                    <v-chip color="primary" variant="tonal" size="small">
                      {{ t("common.id") }}: {{ country.id }}
                    </v-chip>

                    <div class="d-flex gap-2">
                      <v-btn
                        icon="mdi-pencil"
                        size="small"
                        color="warning"
                        variant="text"
                        @click="editCountry(country)"
                        :title="t('common.edit')"
                      />
                      <v-btn
                        icon="mdi-delete"
                        size="small"
                        color="error"
                        variant="text"
                        @click="deleteCountry(country)"
                        :title="t('common.delete')"
                      />
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Loading State -->
          <v-row v-if="countriesStore.loading">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" size="64" />
              <p class="mt-4 text-h6 text-white">
                {{ t("countries.loading") }}
              </p>
            </v-col>
          </v-row>

          <!-- Empty State -->
          <v-row
            v-if="
              !countriesStore.loading &&
              countriesStore.countries.length === 0
            "
          >
            <v-col cols="12" class="text-center">
              <v-card class="custom-card empty-card" elevation="8">
                <v-card-text class="pa-8">
                  <v-icon size="64" color="grey" class="mb-4">
                    mdi-earth
                  </v-icon>
                  <h3 class="text-h5 font-weight-bold mb-2">
                    {{ t("countries.emptyTitle") }}
                  </h3>
                  <p class="text-grey-darken-1 mb-4">
                    {{ t("countries.emptySubtitle") }}
                  </p>
                  <v-btn
                    color="primary"
                    class="custom-btn"
                    @click="openCreateDialog"
                    prepend-icon="mdi-plus"
                  >
                    {{ t("countries.createCountry") }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Pagination -->
          <v-row v-if="countriesStore.pagination.last_page > 1" class="mt-6">
            <v-col cols="12" class="text-center">
              <v-pagination
                v-model="currentPage"
                :length="countriesStore.pagination.last_page"
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
                editingCountry
                  ? t("countries.dialog.editTitle")
                  : t("countries.dialog.createTitle")
              }}
            </h2>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleSubmit" ref="countryForm">
              <v-text-field
                v-model="countryFormData.name"
                :label="t('countries.dialog.name')"
                variant="outlined"
                :rules="nameRules"
                required
              />

              <v-file-input
                v-model="countryFormData.image"
                :label="t('countries.dialog.image')"
                variant="outlined"
                accept="image/*"
                prepend-icon="mdi-camera"
              />

              <div class="d-flex" style="gap: 12px; flex-wrap: wrap">
                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  :loading="countriesStore.loading"
                  :disabled="countriesStore.loading"
                >
                  <v-icon left>
                    {{ editingCountry ? "mdi-content-save" : "mdi-plus" }}
                  </v-icon>
                  {{
                    editingCountry
                      ? t("countries.dialog.updateButton")
                      : t("countries.dialog.createButton")
                  }}
                </v-btn>

                <v-btn color="grey" variant="outlined" @click="closeDialog">
                  {{ t("countries.dialog.cancel") }}
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
              {{ t("countries.dialog.deleteTitle") }}
            </h3>
          </v-card-title>

          <v-card-text class="pa-6">
            <p>
              {{
                t("countries.dialog.deleteConfirm", {
                  name: countryToDelete ? countryToDelete.name : "",
                })
              }}
            </p>
            <p class="text-caption text-grey-darken-1 mt-2">
              {{ t("countries.dialog.deleteWarning") }}
            </p>
          </v-card-text>

          <v-card-actions class="pa-6 pt-0" style="display: flex;
    flex-direction: column-reverse;">
            <v-btn

              color="error"
              variant="outlined"
              @click="confirmDelete"
              :loading="countriesStore.loading"
              block
            >
              {{ t("countries.dialog.deleteButton") }}
            </v-btn>
            <v-btn color="grey" variant="text" @click="closeDeleteDialog" block>
              {{ t("countries.dialog.cancel") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </BaseLayout>
</template>

<style scoped>
.custom-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}

.country-card {
  transition: all 0.3s ease;
  cursor: pointer;
  
}

.country-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.country-image {
  border-radius: 8px 8px 0 0;
}

.empty-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}

.gradient-text {
  background: linear-gradient(45deg, #ff6b35, #d62828);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
