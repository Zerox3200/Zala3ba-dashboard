<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import axios from "axios";
import BaseLayout from "../layouts/BaseLayout.vue";
import AppHeader from "../components/AppHeader.vue";
import FormattedDate from "../components/FormattedDate.vue";
import type {
  AppPlatform,
  AppVersion,
  AppVersionCreatePayload,
  AppVersionUpdatePayload,
} from "../types";
import { useI18n } from "vue-i18n";
import type { VForm } from "vuetify/lib/components/VForm";

const { t } = useI18n();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const androidVersion = ref<AppVersion | null>(null);
const iosVersion = ref<AppVersion | null>(null);
const loadingAndroid = ref(false);
const loadingIos = ref(false);

const openCreateDialog = ref(false);
const openUpdateDialog = ref(false);
const updatingPlatform = ref<AppPlatform | null>(null);
const loadingSave = ref(false);

const createFormRef = ref<VForm>();
const updateFormRef = ref<VForm>();
const createGeneralError = ref("");
const createFieldErrors = ref<Record<string, string>>({});

type ApiValidationResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

const clearCreateErrors = () => {
  createGeneralError.value = "";
  createFieldErrors.value = {};
};

const setCreateApiErrors = (error: unknown) => {
  clearCreateErrors();

  if (!axios.isAxiosError(error)) {
    createGeneralError.value = t("versions.errors.generic");
    return;
  }

  const data = error.response?.data as ApiValidationResponse | undefined;
  if (!data) {
    createGeneralError.value = t("versions.errors.generic");
    return;
  }

  if (data.errors) {
    for (const [field, messages] of Object.entries(data.errors)) {
      if (messages?.length) {
        createFieldErrors.value[field] = messages[0];
      }
    }
  }

  createGeneralError.value =
    data.message ||
    Object.values(createFieldErrors.value)[0] ||
    t("versions.errors.generic");
};

const getCreateFieldError = (field: keyof AppVersionCreatePayload) =>
  createFieldErrors.value[field] ? [createFieldErrors.value[field]] : [];

const defaultForm = (): AppVersionUpdatePayload => ({
  latest_version: "",
  min_required_version: "",
  is_force_update_enabled: false,
  update_message: "",
  update_url: "",
  release_notes: "",
});

const createForm = reactive<AppVersionCreatePayload>({
  platform: "android",
  ...defaultForm(),
});

const updateForm = reactive<AppVersionUpdatePayload>(defaultForm());

const platformOptions = computed(() => [
  {
    title: t("versions.platforms.android"),
    value: "android" as const,
    prependIcon: "mdi-android",
  },
  {
    title: t("versions.platforms.ios"),
    value: "ios" as const,
    prependIcon: "mdi-apple",
  },
]);

const requiredRule = (value: string) =>
  !!value?.toString().trim() || t("form.required");

const urlRule = (value: string) => {
  if (!value?.trim()) return t("form.required");
  try {
    new URL(value);
    return true;
  } catch {
    return t("versions.validation.invalidUrl");
  }
};

const fetchAndroid = async () => {
  try {
    loadingAndroid.value = true;
    const { data } = await axios.get<AppVersion>(
      `${API_BASE_URL}/api/app-version/android`
    );
    androidVersion.value = data;
  } catch {
    androidVersion.value = null;
  } finally {
    loadingAndroid.value = false;
  }
};

const fetchIos = async () => {
  try {
    loadingIos.value = true;
    const { data } = await axios.get<AppVersion>(
      `${API_BASE_URL}/api/app-version/ios`
    );
    iosVersion.value = data;
  } catch {
    iosVersion.value = null;
  } finally {
    loadingIos.value = false;
  }
};

const fetchAll = async () => {
  await Promise.all([fetchAndroid(), fetchIos()]);
};

const resetCreateForm = () => {
  Object.assign(createForm, {
    platform: "android",
    ...defaultForm(),
  });
  clearCreateErrors();
};

const openCreate = () => {
  resetCreateForm();
  openCreateDialog.value = true;
};

const closeCreate = () => {
  openCreateDialog.value = false;
  resetCreateForm();
};

const openUpdate = (version: AppVersion) => {
  updatingPlatform.value = version.platform;
  Object.assign(updateForm, {
    latest_version: version.latest_version,
    min_required_version: version.min_required_version,
    is_force_update_enabled: version.is_force_update_enabled,
    update_message: version.update_message,
    update_url: version.update_url,
    release_notes: version.release_notes,
  });
  openUpdateDialog.value = true;
};

const closeUpdate = () => {
  openUpdateDialog.value = false;
  updatingPlatform.value = null;
  Object.assign(updateForm, defaultForm());
};

const onCreate = async () => {
  const { valid } = (await createFormRef.value?.validate()) ?? { valid: false };
  if (!valid) return;

  try {
    loadingSave.value = true;
    clearCreateErrors();
    await axios.post(`${API_BASE_URL}/api/app-version`, { ...createForm });
    closeCreate();
    await fetchAll();
  } catch (err) {
    setCreateApiErrors(err);
  } finally {
    loadingSave.value = false;
  }
};

const onUpdate = async () => {
  if (!updatingPlatform.value) return;
  const { valid } = (await updateFormRef.value?.validate()) ?? { valid: false };
  if (!valid) return;

  try {
    loadingSave.value = true;
    await axios.put(
      `${API_BASE_URL}/api/app-version/${updatingPlatform.value}`,
      { ...updateForm }
    );
    closeUpdate();
    await fetchAll();
  } catch (err) {
    console.error(err);
  } finally {
    loadingSave.value = false;
  }
};

const platformLabel = (platform: AppPlatform) =>
  platform === "android"
    ? t("versions.platforms.android")
    : t("versions.platforms.ios");

const platformIcon = (platform: AppPlatform) =>
  platform === "android" ? "mdi-android" : "mdi-apple";

onMounted(fetchAll);

watch(
  createForm,
  () => {
    if (createGeneralError.value || Object.keys(createFieldErrors.value).length) {
      clearCreateErrors();
    }
  },
  { deep: true }
);
</script>

<template>
  <BaseLayout>
    <template #title>{{ t("versions.title") }}</template>
    <template #createBtn>
      <v-btn
        color="primary"
        class="custom-btn"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        {{ t("versions.addVersion") }}
      </v-btn>
    </template>

    <v-container>
      <AppHeader
        :title="t('versions.title')"
        :subtitle="t('versions.subtitle')"
      />

      <v-card class="versions-toolbar custom-card mb-4" elevation="4" rounded="lg">
        <v-card-text class="d-flex justify-end pa-3">
          <v-btn
            color="primary"
            variant="flat"
            class="custom-btn versions-refresh-btn"
            prepend-icon="mdi-refresh"
            :loading="loadingAndroid || loadingIos"
            @click="fetchAll"
          >
            {{ t("versions.refresh") }}
          </v-btn>
        </v-card-text>
      </v-card>

      <v-row>
        <v-col cols="12" lg="6">
          <v-card
            class="version-card custom-card"
            elevation="8"
            rounded="lg"
          >
            <div class="version-card__banner">
              <div class="version-card__banner-icon">
                <v-icon size="32" color="white">mdi-android</v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-white mb-0">
                  {{ t("versions.platforms.android") }}
                </h3>
                <p class="text-caption text-white mb-0 version-card__banner-sub">
                  Google Play
                </p>
              </div>
            </div>

            <v-card-text class="pa-5">
              <v-skeleton-loader v-if="loadingAndroid" type="article" />
              <template v-else-if="androidVersion">
                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-chip color="primary" variant="tonal" size="small">
                    {{ t("versions.latest") }}: {{ androidVersion.latest_version }}
                  </v-chip>
                  <v-chip color="accent" variant="tonal" size="small">
                    {{ t("versions.minRequired") }}:
                    {{ androidVersion.min_required_version }}
                  </v-chip>
                  <v-chip
                    :color="
                      androidVersion.is_force_update_enabled ? 'error' : 'grey'
                    "
                    variant="tonal"
                    size="small"
                  >
                    {{
                      androidVersion.is_force_update_enabled
                        ? t("versions.forceUpdateOn")
                        : t("versions.forceUpdateOff")
                    }}
                  </v-chip>
                </div>

                <div class="version-detail mb-3">
                  <span class="version-detail__label">{{
                    t("versions.fields.updateMessage")
                  }}</span>
                  <p class="version-detail__value mb-0">
                    {{ androidVersion.update_message }}
                  </p>
                </div>

                <div class="version-detail mb-3">
                  <span class="version-detail__label">{{
                    t("versions.fields.releaseNotes")
                  }}</span>
                  <p class="version-detail__value version-detail__notes mb-0">
                    {{ androidVersion.release_notes }}
                  </p>
                </div>

                <v-btn
                  :href="androidVersion.update_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-open-in-new"
                  class="mb-4"
                >
                  {{ t("versions.openStore") }}
                </v-btn>

                <v-divider class="mb-3" />

                <div class="d-flex flex-wrap justify-space-between ga-3">
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">
                      {{ t("common.createdAt") }}
                    </span>
                    <FormattedDate :value="androidVersion.created_at" />
                  </div>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">
                      {{ t("common.updatedAt") }}
                    </span>
                    <FormattedDate :value="androidVersion.updated_at" />
                  </div>
                </div>
              </template>
              <div v-else class="text-center py-8">
                <v-icon size="48" color="primary" class="mb-3">
                  mdi-android
                </v-icon>
                <p class="text-subtitle-1 font-weight-medium mb-1">
                  {{ t("versions.emptyTitle") }}
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("versions.emptySubtitle") }}
                </p>
              </div>
            </v-card-text>

            <v-card-actions class="pa-4 pt-0">
              <v-spacer />
              <v-btn
                v-if="androidVersion"
                color="primary"
                variant="flat"
                prepend-icon="mdi-pencil"
                @click="openUpdate(androidVersion)"
              >
                {{ t("versions.updateVersion") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card class="version-card custom-card" elevation="8" rounded="lg">
            <div class="version-card__banner version-card__banner--ios">
              <div class="version-card__banner-icon">
                <v-icon size="32" color="white">mdi-apple</v-icon>
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold text-white mb-0">
                  {{ t("versions.platforms.ios") }}
                </h3>
                <p class="text-caption text-white mb-0 version-card__banner-sub">
                  App Store
                </p>
              </div>
            </div>

            <v-card-text class="pa-5">
              <v-skeleton-loader v-if="loadingIos" type="article" />
              <template v-else-if="iosVersion">
                <div class="d-flex flex-wrap ga-2 mb-4">
                  <v-chip color="primary" variant="tonal" size="small">
                    {{ t("versions.latest") }}: {{ iosVersion.latest_version }}
                  </v-chip>
                  <v-chip color="accent" variant="tonal" size="small">
                    {{ t("versions.minRequired") }}:
                    {{ iosVersion.min_required_version }}
                  </v-chip>
                  <v-chip
                    :color="iosVersion.is_force_update_enabled ? 'error' : 'grey'"
                    variant="tonal"
                    size="small"
                  >
                    {{
                      iosVersion.is_force_update_enabled
                        ? t("versions.forceUpdateOn")
                        : t("versions.forceUpdateOff")
                    }}
                  </v-chip>
                </div>

                <div class="version-detail mb-3">
                  <span class="version-detail__label">{{
                    t("versions.fields.updateMessage")
                  }}</span>
                  <p class="version-detail__value mb-0">
                    {{ iosVersion.update_message }}
                  </p>
                </div>

                <div class="version-detail mb-3">
                  <span class="version-detail__label">{{
                    t("versions.fields.releaseNotes")
                  }}</span>
                  <p class="version-detail__value version-detail__notes mb-0">
                    {{ iosVersion.release_notes }}
                  </p>
                </div>

                <v-btn
                  :href="iosVersion.update_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-open-in-new"
                  class="mb-4"
                >
                  {{ t("versions.openStore") }}
                </v-btn>

                <v-divider class="mb-3" />

                <div class="d-flex flex-wrap justify-space-between ga-3">
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">
                      {{ t("common.createdAt") }}
                    </span>
                    <FormattedDate :value="iosVersion.created_at" />
                  </div>
                  <div>
                    <span class="text-caption text-medium-emphasis d-block">
                      {{ t("common.updatedAt") }}
                    </span>
                    <FormattedDate :value="iosVersion.updated_at" />
                  </div>
                </div>
              </template>
              <div v-else class="text-center py-8">
                <v-icon size="48" color="primary" class="mb-3">
                  mdi-apple
                </v-icon>
                <p class="text-subtitle-1 font-weight-medium mb-1">
                  {{ t("versions.emptyTitle") }}
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ t("versions.emptySubtitle") }}
                </p>
              </div>
            </v-card-text>

            <v-card-actions class="pa-4 pt-0">
              <v-spacer />
              <v-btn
                v-if="iosVersion"
                color="primary"
                variant="flat"
                prepend-icon="mdi-pencil"
                @click="openUpdate(iosVersion)"
              >
                {{ t("versions.updateVersion") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Create -->
    <v-dialog v-model="openCreateDialog" max-width="640" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-5">
          <v-icon class="me-2" color="primary">mdi-cellphone-arrow-down</v-icon>
          <span class="text-h6 font-weight-bold">{{ t("versions.createTitle") }}</span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-alert
            v-if="createGeneralError"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-4"
            prominent
            border="start"
            closable
            @click:close="createGeneralError = ''"
          >
            {{ createGeneralError }}
          </v-alert>

          <v-form ref="createFormRef" @submit.prevent="onCreate">
            <v-select
              v-model="createForm.platform"
              :items="platformOptions"
              item-title="title"
              item-value="value"
              :label="t('versions.fields.platform')"
              :error-messages="getCreateFieldError('platform')"
              variant="outlined"
              class="mb-2"
            />
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.latest_version"
                  :label="t('versions.fields.latestVersion')"
                  :rules="[requiredRule]"
                  :error-messages="getCreateFieldError('latest_version')"
                  variant="outlined"
                  placeholder="2.5.0"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createForm.min_required_version"
                  :label="t('versions.fields.minRequiredVersion')"
                  :rules="[requiredRule]"
                  :error-messages="getCreateFieldError('min_required_version')"
                  variant="outlined"
                  placeholder="2.3.0"
                />
              </v-col>
            </v-row>
            <v-switch
              v-model="createForm.is_force_update_enabled"
              :label="t('versions.fields.forceUpdate')"
              color="error"
              hide-details
              class="mb-3"
            />
            <v-text-field
              v-model="createForm.update_message"
              :label="t('versions.fields.updateMessage')"
              :rules="[requiredRule]"
              :error-messages="getCreateFieldError('update_message')"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="createForm.update_url"
              :label="t('versions.fields.updateUrl')"
              :rules="[urlRule]"
              :error-messages="getCreateFieldError('update_url')"
              variant="outlined"
              class="mb-2"
            />
            <v-textarea
              v-model="createForm.release_notes"
              :label="t('versions.fields.releaseNotes')"
              :rules="[requiredRule]"
              :error-messages="getCreateFieldError('release_notes')"
              variant="outlined"
              rows="3"
              auto-grow
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-5">
          <v-spacer />
          <v-btn variant="text" @click="closeCreate">{{ t("form.cancel") }}</v-btn>
          <v-btn
            color="primary"
            class="custom-btn"
            :loading="loadingSave"
            @click="onCreate"
          >
            {{ t("versions.createButton") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Update -->
    <v-dialog v-model="openUpdateDialog" max-width="640" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-5">
          <v-icon class="me-2" :color="updatingPlatform === 'android' ? 'success' : 'primary'">
            {{ updatingPlatform ? platformIcon(updatingPlatform) : "mdi-pencil" }}
          </v-icon>
          <span class="text-h6 font-weight-bold">
            {{
              updatingPlatform
                ? t("versions.updateTitle", {
                    platform: platformLabel(updatingPlatform),
                  })
                : t("versions.updateVersion")
            }}
          </span>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-form ref="updateFormRef" @submit.prevent="onUpdate">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="updateForm.latest_version"
                  :label="t('versions.fields.latestVersion')"
                  :rules="[requiredRule]"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="updateForm.min_required_version"
                  :label="t('versions.fields.minRequiredVersion')"
                  :rules="[requiredRule]"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            <v-switch
              v-model="updateForm.is_force_update_enabled"
              :label="t('versions.fields.forceUpdate')"
              color="error"
              hide-details
              class="mb-3"
            />
            <v-text-field
              v-model="updateForm.update_message"
              :label="t('versions.fields.updateMessage')"
              :rules="[requiredRule]"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="updateForm.update_url"
              :label="t('versions.fields.updateUrl')"
              :rules="[urlRule]"
              variant="outlined"
              class="mb-2"
            />
            <v-textarea
              v-model="updateForm.release_notes"
              :label="t('versions.fields.releaseNotes')"
              :rules="[requiredRule]"
              variant="outlined"
              rows="3"
              auto-grow
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-5">
          <v-spacer />
          <v-btn variant="text" @click="closeUpdate">{{ t("form.cancel") }}</v-btn>
          <v-btn
            color="primary"
            class="custom-btn"
            :loading="loadingSave"
            @click="onUpdate"
          >
            {{ t("versions.saveButton") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </BaseLayout>
</template>

<style scoped>
.versions-toolbar {
  background: rgba(255, 255, 255, 0.97) !important;
  backdrop-filter: blur(10px);
}

.versions-refresh-btn {
  min-width: 140px;
  color: rgb(var(--v-theme-on-primary)) !important;
}

.version-card {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.97);
  height: 100%;
}

.version-card__banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
}

.version-card__banner--ios {
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-accent)) 0%,
    rgb(var(--v-theme-secondary)) 100%
  );
}

.version-card__banner-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
}

.version-card__banner-sub {
  opacity: 0.9;
}

.version-detail__label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 4px;
}

.version-detail__value {
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.85);
}

.version-detail__notes {
  white-space: pre-wrap;
  line-height: 1.5;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.06);
  border-inline-start: 3px solid rgb(var(--v-theme-primary));
}
</style>
