<script setup lang="ts">
import { computed, ref } from "vue";
import BaseLayout from "../layouts/BaseLayout.vue";
import { Payment } from "../types/Payment";
import type { ApiResponse } from "../types";
import axios from "axios";
import AppHeader from "../components/AppHeader.vue";
import FormattedDate from "../components/FormattedDate.vue";
import { useI18n } from "vue-i18n";
import { VDataTableServer } from "vuetify/lib/components/VDataTable/VDataTableServer";

const { t } = useI18n();

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
    title: t("payments.table.headers.fawaterakInvoiceId"),
    key: "fawaterak_invoice_id",
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

type PaymentStatusFilter = "all" | "pending" | "successful" | "failed";

const statusFilter = ref<PaymentStatusFilter>("all");
const statusOptions = computed(() => [
  { title: t("payments.status.all"), value: "all" as const },
  { title: t("payments.status.pending"), value: "pending" as const },
  { title: t("payments.status.successful"), value: "successful" as const },
  { title: t("payments.status.failed"), value: "failed" as const },
]);

const payments = ref<Payment[]>([]);
const loadingGetPayments = ref(false);
const totalPaymentsCount = ref(0);
const page = ref(1);
const itemsPerPage = ref(15);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const onGetPayment = async (page: number, perPage: number) => {
  try {
    loadingGetPayments.value = true;
    const params: Record<string, number | string> = {
      page,
      per_page: perPage,
    };

    if (statusFilter.value !== "all") {
      params.status = statusFilter.value;
    }

    const { data } = await axios.get<ApiResponse<Payment>>(
      `${API_BASE_URL}/api/payments`,
      { params }
    );

    payments.value = [...data.data];
    totalPaymentsCount.value = data.total;
  } catch (err) {
    console.log(err);
  } finally {
    loadingGetPayments.value = false;
  }
};

const loadPayments = async ({
  page: tablePage,
  itemsPerPage: perPage,
}: {
  page: number;
  itemsPerPage: number;
}) => {
  page.value = tablePage;
  itemsPerPage.value = perPage;
  await onGetPayment(tablePage, perPage);
};

const handleStatusFilterChange = async () => {
  page.value = 1;
  await onGetPayment(1, itemsPerPage.value);
};

const statusColor = (status: Payment["status"]) => {
  switch (status) {
    case "successful":
      return "success";
    case "failed":
      return "error";
    default:
      return "warning";
  }
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

        <v-card class="mb-4">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="statusFilter"
                  :items="statusOptions"
                  :label="t('payments.filterByStatus')"
                  variant="outlined"
                  hide-details="auto"
                  @update:model-value="handleStatusFilterChange"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-data-table-server
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          :headers="tableHeaders"
          :items="payments"
          :items-length="totalPaymentsCount"
          :loading="loadingGetPayments"
          item-value="id"
          @update:options="loadPayments"
        >
          <template #item.fawaterak_invoice_id="{ item }">
            <span
              v-if="item.status === 'failed'"
              class="text-medium-emphasis"
            >
              {{ t("payments.table.unavailable") }}
            </span>
            <span v-else class="font-weight-medium">
              {{ item.fawaterak_invoice_id }}
            </span>
          </template>
          <template #item.status="{ item }">
            <v-chip
              :color="statusColor(item.status)"
              size="small"
              variant="tonal"
            >
              {{ t(`payments.status.${item.status}`) }}
            </v-chip>
          </template>
          <template #item.created_at="{ item }">
            <FormattedDate :value="item.created_at" />
          </template>
        </v-data-table-server>
      </v-container>
    </div>
  </BaseLayout>
</template>
