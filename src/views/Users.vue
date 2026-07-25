<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import axios from "axios";
import BaseLayout from "../layouts/BaseLayout.vue";
import type {
  CreateUserPayload,
  PaginatedApiResponse,
  User,
} from "../types";
import AppHeader from "../components/AppHeader.vue";
import CreateUserFormFields from "../components/CreateUserFormFields.vue";
import FormattedDate from "../components/FormattedDate.vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
import type { VForm } from "vuetify/lib/components/VForm";
import { VDataTableServer } from "vuetify/lib/components/VDataTable/VDataTableServer";

const { t } = useI18n();
const display = useDisplay();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type TableHeaders = VDataTableServer["$props"]["headers"];
const tableHeaders = ref<TableHeaders>([
  {
    title: t("users.table.headers.id"),
    key: "id",
    align: "center",
    sortable: false,
  },
  {
    title: t("users.table.headers.name"),
    key: "name",
    align: "center",
    sortable: false,
  },
  {
    title: t("users.table.headers.email"),
    key: "email",
    align: "center",
    sortable: false,
  },
  {
    title: t("users.table.headers.phone"),
    key: "phone",
    align: "center",
    sortable: false,
  },
  {
    title: t("users.table.headers.emailVerified"),
    key: "email_verified",
    align: "center",
    sortable: false,
  },
  {
    title: t("users.table.headers.phoneVerified"),
    key: "phone_verified",
    align: "center",
    sortable: false,
  },
  {
    title: t("users.table.headers.availableGames"),
    key: "available_games",
    align: "center",
    sortable: false,
  },
  {
    title: t("users.table.headers.role"),
    key: "role",
    align: "center",
    sortable: false,
  },
  {
    title: t("users.table.headers.createdAt"),
    key: "created_at",
    align: "center",
    sortable: false,
  },
  {
    title: t("users.table.headers.actions"),
    key: "actions",
    align: "center",
    sortable: false,
  },
]);

const itemsPerPageOptions = [10, 25, 50, 100];

const users = ref<User[]>([]);
const loadingGetUsers = ref(false);
const totalUsersCount = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);
const searchQuery = ref("");

const fetchUsers = async (pageNum: number, perPage: number) => {
  try {
    loadingGetUsers.value = true;
    const params: Record<string, number | string> = {
      page: pageNum,
      pageSize: perPage,
    };

    const trimmedSearch = searchQuery.value.trim();
    if (trimmedSearch) {
      params.search = trimmedSearch;
    }

    const { data } = await axios.get<PaginatedApiResponse<User>>(
      `${API_BASE_URL}/api/users`,
      { params }
    );

    users.value = [...data.data];
    totalUsersCount.value = data.meta.total;
    page.value = data.meta.current_page;
    itemsPerPage.value = data.meta.per_page;
  } catch (err) {
    console.log(err);
  } finally {
    loadingGetUsers.value = false;
  }
};

const loadUsers = async ({
  page: tablePage,
  itemsPerPage: perPage,
}: {
  page: number;
  itemsPerPage: number;
}) => {
  if (perPage <= 0) return;

  page.value = tablePage;
  itemsPerPage.value = perPage;
  await fetchUsers(tablePage, perPage);
};

const handleSearch = () => {
  page.value = 1;
  fetchUsers(1, itemsPerPage.value);
};

const clearSearch = () => {
  searchQuery.value = "";
  page.value = 1;
  fetchUsers(1, itemsPerPage.value);
};

const getDefaultCreateForm = (): CreateUserPayload => ({
  name: "",
  email: "",
  country_code: "+20",
  phone_number: "",
  role: "user",
  available_games: 0,
  password: "",
});

const createForm = ref<CreateUserPayload>(getDefaultCreateForm());
const openCreateDialog = ref(false);
const loadingCreate = ref(false);
const showCreatePassword = ref(false);
const createUserForm = ref<InstanceType<typeof CreateUserFormFields>>();
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
    createGeneralError.value = t("users.errors.generic");
    return;
  }

  const data = error.response?.data as ApiValidationResponse | undefined;
  if (!data) {
    createGeneralError.value = t("users.errors.generic");
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
    t("users.errors.generic");

  if (!display.mdAndUp.value && openCreateDialog.value) {
    const errors = createFieldErrors.value;
    if (errors.email || errors.name || errors.password) {
      createUserForm.value?.goToMobileStep(0);
    } else if (errors.country_code || errors.phone_number) {
      createUserForm.value?.goToMobileStep(1);
    } else if (errors.available_games) {
      createUserForm.value?.goToMobileStep(2);
    }
  }
};

const getCreateFieldError = (field: keyof CreateUserPayload) =>
  createFieldErrors.value[field] ? [createFieldErrors.value[field]] : [];

const onOpenCreateDialog = async () => {
  createForm.value = getDefaultCreateForm();
  showCreatePassword.value = false;
  clearCreateErrors();
  openCreateDialog.value = true;
  await nextTick();
  createUserForm.value?.resetMobile();
};

const handleMobileNext = async () => {
  await createUserForm.value?.nextMobileStep();
};

const handleMobileBack = () => {
  createUserForm.value?.prevMobileStep();
};

const createMobileStep = computed(() => {
  const step = createUserForm.value?.mobileStep;
  if (typeof step === "number") return step;
  return 0;
});

const isCreateMobileLastStep = computed(() => createMobileStep.value === 2);

const onCloseCreateDialog = () => {
  openCreateDialog.value = false;
  createForm.value = getDefaultCreateForm();
  clearCreateErrors();
};

const onCreateUser = async () => {
  try {
    loadingCreate.value = true;
    clearCreateErrors();
    await axios.post(`${API_BASE_URL}/api/users`, createForm.value);
    onCloseCreateDialog();
    await fetchUsers(page.value, itemsPerPage.value);
  } catch (err) {
    setCreateApiErrors(err);
  } finally {
    loadingCreate.value = false;
  }
};

watch(
  createForm,
  () => {
    if (createGeneralError.value || Object.keys(createFieldErrors.value).length) {
      clearCreateErrors();
    }
  },
  { deep: true }
);

const clickCreateUser = async () => {
  const result = await createUserForm.value?.validate();
  if (!result?.valid) return;
  await onCreateUser();
};

const userToUpdate = ref<User | null>(null);
const updateAvailableGames = ref(0);
const openUpdateDialog = ref(false);
const loadingUpdate = ref(false);
const updateUserForm = ref<VForm>();

const onOpenUpdateDialog = (user: User) => {
  userToUpdate.value = user;
  updateAvailableGames.value = user.available_games;
  openUpdateDialog.value = true;
};

const onCloseUpdateDialog = () => {
  openUpdateDialog.value = false;
  userToUpdate.value = null;
};

const onUpdateUser = async () => {
  if (!userToUpdate.value) return;
  try {
    loadingUpdate.value = true;
    await axios.post(`${API_BASE_URL}/api/users/${userToUpdate.value.id}`, {
      available_games: updateAvailableGames.value,
    });
    onCloseUpdateDialog();
    await fetchUsers(page.value, itemsPerPage.value);
  } catch (err) {
    console.log(err);
  } finally {
    loadingUpdate.value = false;
  }
};

const clickUpdateUser = async () => {
  if (!updateUserForm.value) return;
  const { valid } = await updateUserForm.value.validate();
  if (valid) await onUpdateUser();
};

const userToDelete = ref<User | null>(null);
const openDeleteDialog = ref(false);
const loadingDelete = ref(false);

const onOpenDeleteDialog = (user: User) => {
  userToDelete.value = user;
  openDeleteDialog.value = true;
};

const onCloseDeleteDialog = () => {
  openDeleteDialog.value = false;
  userToDelete.value = null;
};

const onDeleteUser = async () => {
  if (!userToDelete.value) return;
  try {
    loadingDelete.value = true;
    await axios.delete(
      `${API_BASE_URL}/api/users/${userToDelete.value.id}`
    );
    onCloseDeleteDialog();
    await fetchUsers(page.value, itemsPerPage.value);
  } catch (err) {
    console.log(err);
  } finally {
    loadingDelete.value = false;
  }
};

const availableGamesRule = (value: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return t("users.validation.availableGamesRequired");
  }
  if (value < 0) return t("users.validation.availableGamesMin");
  return true;
};

const roleLabel = (role: string) =>
  role === "admin" ? t("users.roles.admin") : t("users.roles.user");

const formatPhone = (user: User) => {
  if (!user.phone_number) return t("users.table.notAvailable");
  return user.country_code
    ? `${user.country_code} ${user.phone_number}`
    : user.phone_number;
};

const verificationLabel = (verified: boolean) =>
  verified ? t("users.table.verified") : t("users.table.notVerified");
</script>

<template>
  <BaseLayout>
    <template #title> {{ t("users.title") }} </template>
    <template #createBtn>
      <v-btn
        color="primary"
        class="custom-btn"
        prepend-icon="mdi-account-plus"
        @click="onOpenCreateDialog"
      >
        {{ t("users.addUser") }}
      </v-btn>
    </template>

    <div>
      <v-container>
        <AppHeader
          :title="t('users.title')"
          :subtitle="t('users.subtitle')"
        />

        <v-card class="mb-4">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  :label="t('users.searchPlaceholder')"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  hide-details="auto"
                  clearable
                  @keyup.enter="handleSearch"
                  @click:clear="clearSearch"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-btn
                  color="primary"
                  block
                  class="custom-btn"
                  @click="handleSearch"
                >
                  {{ t("common.search") }}
                </v-btn>
              </v-col>
              <v-col cols="12" md="3" class="text-md-end">
                <v-chip color="primary" variant="tonal">
                  {{ t("users.total") }}: {{ totalUsersCount }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-data-table-server
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :headers="tableHeaders"
          :items="users"
          :items-length="totalUsersCount"
          :items-per-page-options="itemsPerPageOptions"
          :loading="loadingGetUsers"
          item-value="id"
          class="users-table"
          @update:options="loadUsers"
        >
          <template #item.phone="{ item }">
            <span class="text-body-2">{{ formatPhone(item) }}</span>
          </template>
          <template #item.email_verified="{ item }">
            <v-chip
              :color="item.email_verified ? 'success' : 'warning'"
              size="small"
              variant="tonal"
              :prepend-icon="item.email_verified ? 'mdi-check-circle' : 'mdi-clock-outline'"
            >
              {{ verificationLabel(item.email_verified) }}
            </v-chip>
          </template>
          <template #item.phone_verified="{ item }">
            <v-chip
              :color="item.phone_verified ? 'success' : 'warning'"
              size="small"
              variant="tonal"
              :prepend-icon="item.phone_verified ? 'mdi-check-circle' : 'mdi-clock-outline'"
            >
              {{ verificationLabel(item.phone_verified) }}
            </v-chip>
          </template>
          <template #item.role="{ item }">
            <v-chip
              :color="item.role === 'admin' ? 'primary' : 'default'"
              size="small"
              variant="tonal"
            >
              {{ roleLabel(item.role) }}
            </v-chip>
          </template>
          <template #item.created_at="{ item }">
            <FormattedDate :value="item.created_at" />
          </template>
          <template #item.actions="{ item }">
            <div class="d-flex justify-center ga-1 flex-wrap">
              <v-btn
                icon
                variant="text"
                color="warning"
                :title="t('users.dialog.updateTitle')"
                @click="onOpenUpdateDialog(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                variant="text"
                color="error"
                :title="t('users.dialog.deleteTitle')"
                @click="onOpenDeleteDialog(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table-server>
      </v-container>

      <!-- Create user — desktop -->
      <v-dialog
        v-if="display.mdAndUp"
        v-model="openCreateDialog"
        max-width="640"
        scrollable
      >
        <v-card class="create-user-dialog" rounded="lg" elevation="12">
          <div class="create-user-dialog__header">
            <div class="create-user-dialog__header-main">
              <div class="create-user-dialog__icon-wrap">
                <v-icon size="26" color="white">mdi-account-plus</v-icon>
              </div>
              <div>
                <h2 class="text-h6 font-weight-bold text-white mb-1">
                  {{ t("users.dialog.createTitle") }}
                </h2>
                <p class="text-body-2 create-user-dialog__subtitle mb-0">
                  {{ t("users.dialog.createSubtitle") }}
                </p>
              </div>
            </div>
            <v-btn
              icon
              variant="text"
              color="white"
              size="small"
              :aria-label="t('users.dialog.cancel')"
              @click="onCloseCreateDialog"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>

          <v-card-text class="create-user-dialog__body pa-5 pa-sm-6">
            <v-alert
              v-if="createGeneralError"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mb-5"
              prominent
              border="start"
              closable
              @click:close="createGeneralError = ''"
            >
              {{ createGeneralError }}
            </v-alert>

            <CreateUserFormFields
              ref="createUserForm"
              :form="createForm"
              :get-field-error="getCreateFieldError"
              v-model:show-password="showCreatePassword"
              layout="desktop"
            />
          </v-card-text>

          <v-divider />
          <v-card-actions class="create-user-dialog__actions pa-4 pa-sm-5">
            <v-chip
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-shield-account-outline"
            >
              {{ t("users.dialog.defaultRoleNote") }}
            </v-chip>
            <v-spacer />
            <v-btn
              variant="outlined"
              color="grey-darken-1"
              class="me-2"
              :disabled="loadingCreate"
              @click="onCloseCreateDialog"
            >
              {{ t("users.dialog.cancel") }}
            </v-btn>
            <v-btn
              color="primary"
              class="custom-btn px-6"
              size="large"
              :loading="loadingCreate"
              prepend-icon="mdi-check"
              @click="clickCreateUser"
            >
              {{ t("users.dialog.createButton") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create user — mobile -->
      <v-dialog
        v-else
        v-model="openCreateDialog"
        fullscreen
        transition="dialog-bottom-transition"
        content-class="create-user-mobile-dialog"
      >
        <v-card class="create-user-mobile d-flex flex-column h-100">
          <div
            class="create-user-mobile__header create-user-mobile__header--compact"
          >
            <v-btn
              icon
              variant="text"
              color="white"
              :aria-label="t('users.dialog.cancel')"
              @click="onCloseCreateDialog"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </div>

          <div class="create-user-mobile__body pa-4">
            <v-alert
              v-if="createGeneralError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-3"
              border="start"
              closable
              @click:close="createGeneralError = ''"
            >
              {{ createGeneralError }}
            </v-alert>

            <CreateUserFormFields
              ref="createUserForm"
              :form="createForm"
              :get-field-error="getCreateFieldError"
              v-model:show-password="showCreatePassword"
              layout="mobile"
            />
          </div>

          <div class="create-user-mobile__footer">
            <div class="d-flex ga-2 mb-2">
              <v-btn
                v-if="createMobileStep > 0"
                variant="outlined"
                color="grey-darken-1"
                class="flex-grow-1"
                :disabled="loadingCreate"
                prepend-icon="mdi-chevron-left"
                @click="handleMobileBack"
              >
                {{ t("common.back") }}
              </v-btn>
              <v-btn
                v-if="!isCreateMobileLastStep"
                color="primary"
                class="custom-btn flex-grow-1"
                size="large"
                append-icon="mdi-chevron-right"
                @click="handleMobileNext"
              >
                {{ t("common.next") }}
              </v-btn>
              <v-btn
                v-else
                color="primary"
                class="custom-btn flex-grow-1"
                size="large"
                :loading="loadingCreate"
                prepend-icon="mdi-check"
                @click="clickCreateUser"
              >
                {{ t("users.dialog.createButton") }}
              </v-btn>
            </div>
            <p class="text-center text-caption text-medium-emphasis mb-2">
              {{ t("users.dialog.defaultRoleNote") }}
            </p>
            <v-btn
              variant="text"
              color="grey-darken-1"
              block
              size="small"
              :disabled="loadingCreate"
              @click="onCloseCreateDialog"
            >
              {{ t("users.dialog.cancel") }}
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Update user -->
      <v-dialog
        v-model="openUpdateDialog"
        max-width="480"
        scrollable
        :fullscreen="$vuetify.display.smAndDown"
      >
        <v-card class="user-dialog">
          <v-card-title class="pa-4 pa-sm-6">
            <div class="text-h6 font-weight-bold">
              {{ t("users.dialog.updateTitle") }}
            </div>
            <p
              v-if="userToUpdate"
              class="text-body-2 text-medium-emphasis mt-1 mb-0"
            >
              {{
                t("users.dialog.updateSubtitle", { name: userToUpdate.name })
              }}
            </p>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4 pa-sm-6">
            <v-form ref="updateUserForm" @submit.prevent="clickUpdateUser">
              <v-text-field
                v-model.number="updateAvailableGames"
                :label="t('users.dialog.availableGames')"
                :rules="[availableGamesRule]"
                type="number"
                min="0"
                variant="outlined"
                prepend-inner-icon="mdi-gamepad-variant"
              />
            </v-form>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4 pa-sm-6 flex-wrap ga-2">
            <v-spacer />
            <v-btn variant="text" @click="onCloseUpdateDialog">
              {{ t("users.dialog.cancel") }}
            </v-btn>
            <v-btn
              color="primary"
              class="custom-btn"
              :loading="loadingUpdate"
              @click="clickUpdateUser"
            >
              {{ t("users.dialog.updateButton") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete user -->
      <v-dialog v-model="openDeleteDialog" max-width="520" persistent>
        <v-card class="user-dialog">
          <v-card-title class="d-flex align-center text-error pa-4 pa-sm-6">
            <v-icon class="me-2">mdi-alert-circle</v-icon>
            <span class="text-h6 font-weight-bold">
              {{ t("users.dialog.deleteTitle") }}
            </span>
          </v-card-title>
          <v-card-text class="pa-4 pa-sm-6">
            <p v-if="userToDelete" class="text-body-1 mb-3">
              {{
                t("users.dialog.deleteConfirm", {
                  name: userToDelete.name,
                  email: userToDelete.email,
                })
              }}
            </p>
            <v-alert type="error" variant="tonal" density="comfortable">
              {{ t("users.dialog.deleteWarning") }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="pa-4 pa-sm-6 flex-wrap ga-2">
            <v-spacer />
            <v-btn variant="text" @click="onCloseDeleteDialog">
              {{ t("users.dialog.cancel") }}
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              :loading="loadingDelete"
              @click="onDeleteUser"
            >
              {{ t("users.dialog.deleteButton") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </BaseLayout>
</template>

<style scoped>
.users-table {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
}

.user-dialog {
  border-radius: 12px;
}

.create-user-dialog {
  overflow: hidden;
}

.create-user-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #d62828 100%);
}

.create-user-dialog__header-main {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.create-user-dialog__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.create-user-dialog__subtitle {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.45;
}

.create-user-dialog__body {
  background: #fafafa;
}

.form-section {
  background: #fff;
}

.form-section-label {
  color: rgba(0, 0, 0, 0.55);
  letter-spacing: 0.08em;
  font-weight: 600;
}

.create-user-dialog__actions {
  background: #fff;
  flex-wrap: wrap;
  gap: 8px;
}

.create-user-mobile-dialog {
  margin: 0;
  max-height: 100%;
}

.create-user-mobile {
  background: #f5f5f5;
}

.create-user-mobile__header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #ff6b35 0%, #d62828 100%);
}

.create-user-mobile__header--compact {
  padding: 8px 4px;
  padding-top: max(8px, env(safe-area-inset-top));
}

.create-user-mobile__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.create-user-mobile__footer {
  flex-shrink: 0;
  padding: 12px 16px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
}
</style>
