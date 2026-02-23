<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseLayout from "../layouts/BaseLayout.vue";
import { User } from "../types";
import axios from "axios";
import AppHeader from "../components/AppHeader.vue";
import { useI18n } from "vue-i18n";
import { VDataTableServer } from "vuetify/lib/components/VDataTable/VDataTableServer";

// translation
const { t } = useI18n();

// table data
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
]);

// get users
const users = ref<User[]>([]);
const loadingGetUsers = ref(false);
const totalUsersCount = ref();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const onGetUser = async (page: number, pageSize: number, search?: string) => {
  try {
    loadingGetUsers.value = true;
    const { data } = await axios.get<{ data: User[]; total: number }>(
      `${API_BASE_URL}/api/users`,
      {
        params: {
          page,
          pageSize,
          search,
        },
      }
    );

    users.value = [...data.data];
    totalUsersCount.value = data.total;
  } catch (err) {
    console.log(err);
  } finally {
    loadingGetUsers.value = false;
  }
};

// load user
const loadUsers = async ({
  page,
  itemsPerPage,
}: {
  page: number;
  itemsPerPage: number;
}) => {
  await onGetUser(page, itemsPerPage);
};
</script>

<template>
  <BaseLayout>
    <template #title> {{ t("users.title") }} </template>
    <div>
      <v-container>
        <AppHeader :title="t('users.title')" :subtitle="t('users.subtitle')" />
        <v-data-table-server
          :headers="tableHeaders"
          :items="users"
          :items-length="totalUsersCount"
          :loading="loadingGetUsers"
          item-value="name"
          @update:options="loadUsers"
        ></v-data-table-server>
      </v-container>
    </div>
  </BaseLayout>
</template>
