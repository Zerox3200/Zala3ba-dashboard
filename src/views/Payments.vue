<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseLayout from "../layouts/BaseLayout.vue";
import { Payment } from "../types/Payment";
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
    title: t("payments.table.headers.id"),
    key: "id",
    align: "center",
    sortable: false,
  },
  {
    title: t("payments.table.headers.username"),
    key: "user.name",
    align: "center",
    sortable: false,
  },
  {
    title: t("payments.table.headers.amount"),
    key: "amount",
    align: "center",
    sortable: false,
  },
  {
    title: t("payments.table.headers.gamesPurchased"),
    key: "games_purchased",
    align: "center",
    sortable: false,
  },
  {
    title: t("payments.table.headers.paymobOrderId"),
    key: "paymob_order_id",
    align: "center",
    sortable: false,
  },
  {
    title: t("payments.table.headers.status"),
    key: "status",
    align: "center",
    sortable: false,
  },
  {
    title: t("payments.table.headers.createdAt"),
    key: "created_at",
    align: "center",
    sortable: false,
  },
]);

// get payments
const payments = ref<Payment[]>([]);
const loadingGetPayments = ref(false);
const totalPaymentsCount = ref();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const onGetPayment = async (
  page: number,
  pageSize: number,
  search?: string
) => {
  try {
    loadingGetPayments.value = true;
    const { data } = await axios.get<{ data: Payment[]; total: number }>(
      `${API_BASE_URL}/api/payments`,
      {
        params: {
          page,
          pageSize,
          search,
        },
      }
    );

    payments.value = [...data.data];
    totalPaymentsCount.value = data.total;
  } catch (err) {
    console.log(err);
  } finally {
    loadingGetPayments.value = false;
  }
};

// load payment
const loadPayments = async ({
  page,
  itemsPerPage,
}: {
  page: number;
  itemsPerPage: number;
}) => {
  await onGetPayment(page, itemsPerPage);
};
</script>

<template>
  <BaseLayout>
    <template #title> {{ t("payments.title") }} </template>
    <div>
      <v-container>
        <AppHeader
          :title="t('payments.title')"
          :subtitle="t('payments.subtitle')"
        />
        <v-data-table-server
          :headers="tableHeaders"
          :items="payments"
          :items-length="totalPaymentsCount"
          :loading="loadingGetPayments"
          item-value="name"
          @update:options="loadPayments"
        ></v-data-table-server>
      </v-container>
    </div>
  </BaseLayout>
</template>
