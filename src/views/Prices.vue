<script setup lang="ts">
import { computed, ref } from "vue";
import BaseLayout from "../layouts/BaseLayout.vue";
import { Price } from "../types/Price";
import axios from "axios";
import AppHeader from "../components/AppHeader.vue";
import { useI18n } from "vue-i18n";
import { VDataTableServer } from "vuetify/lib/components/VDataTable/VDataTableServer";
import { VForm } from "vuetify/lib/components/VForm/VForm";

// translation
const { t } = useI18n();

// table data
type TableHeaders = VDataTableServer["$props"]["headers"];
const tableHeaders = ref<TableHeaders>([
  {
    title: t("prices.table.headers.id"),
    key: "id",
    align: "center",
    sortable: false,
  },
  {
    title: t("prices.table.headers.price"),
    key: "price",
    align: "center",
    sortable: false,
  },
  {
    title: t("prices.table.headers.discount"),
    key: "discount",
    align: "center",
    sortable: false,
  },
  {
    title: t("prices.table.headers.gamesNumber"),
    key: "games_number",
    align: "center",
    sortable: false,
  },
  {
    title: t("prices.table.headers.totalPrice"),
    key: "total_price",
    align: "center",
    sortable: false,
  },
  {
    title: t("prices.table.headers.createdAt"),
    key: "created_at",
    align: "center",
    sortable: false,
  },
  {
    title: t("prices.table.headers.actions"),
    key: "actions",
    align: "center",
    sortable: false,
  },
]);

// get prices
const prices = ref<Price[]>([]);
const loadingGetPrices = ref(false);
const totalPricesCount = ref();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const onGetPrice = async (page: number, pageSize: number, search?: string) => {
  try {
    loadingGetPrices.value = true;
    const { data } = await axios.get<{ data: Price[]; total: number }>(
      `${API_BASE_URL}/api/prices`,
      {
        params: {
          page,
          pageSize,
          search,
        },
      }
    );

    prices.value = [...data.data];
    totalPricesCount.value = data.total;
  } catch (err) {
    console.log(err);
  } finally {
    loadingGetPrices.value = false;
  }
};

// load price
const loadPrices = async ({
  page,
  itemsPerPage,
}: {
  page: number;
  itemsPerPage: number;
}) => {
  await onGetPrice(page, itemsPerPage);
};

const openCreatePriceDialog = ref(false);
const onOpenCreatePriceDialog = () => {
  openCreatePriceDialog.value = true;
};
const onCloseCreatePriceDialog = () => {
  openCreatePriceDialog.value = false;
};

const loadingCreatePrice = ref(false);
const price = ref({
  price: undefined,
  discount: undefined,
  games_number: undefined,
});
const totalPrice = computed(() => {
  if (price.value.price && price.value.discount && price.value.games_number) {
    return price.value.price - price.value.price * (price.value.discount / 100);
  }
  return 0;
});
const validateNumber = (value: number) => {
  if (value === undefined || value === null || isNaN(value)) {
    return t("form.required");
  }
  if (value < 0) {
    return t("form.positiveNumber");
  }
  return true;
};
const createPriceForm = ref<VForm>();
const onCreatePrice = async (priceData: {
  price: number;
  discount: number;
  games_number: number;
  total_price: number;
}) => {
  try {
    loadingCreatePrice.value = true;
    await axios.post(`${API_BASE_URL}/api/prices`, priceData);
    await loadPrices({ page: 1, itemsPerPage: 10 });
    onCloseCreatePriceDialog();
  } catch (err) {
    console.log(err);
  } finally {
    loadingCreatePrice.value = false;
  }
};
const clickCreatePrice = async () => {
  if (createPriceForm.value) {
    const isValid = await createPriceForm.value.validate();
    if (isValid) {
      await onCreatePrice({
        price: price.value.price!,
        discount: price.value.discount!,
        games_number: price.value.games_number!,
        total_price: totalPrice.value,
      });
      price.value = {
        price: undefined,
        discount: undefined,
        games_number: undefined,
      };
    }
  }
};

const openUpdatePriceDialog = ref(false);
const priceToUpdate = ref<Price>({
  id: 0,
  price: 0,
  discount: 0,
  games_number: 0,
  total_price: 0,
  created_at: "",
  updated_at: "",
});
const updatedTotalPrice = computed(() => {
  if (
    priceToUpdate.value.price &&
    priceToUpdate.value.discount &&
    priceToUpdate.value.games_number
  ) {
    return (
      priceToUpdate.value.price -
      priceToUpdate.value.price * (priceToUpdate.value.discount / 100)
    );
  }
  return 0;
});
const onOpenUpdatePriceDialog = (updatedPrice: Price) => {
  priceToUpdate.value = updatedPrice;
  openUpdatePriceDialog.value = true;
};
const onCloseUpdatePriceDialog = () => {
  openUpdatePriceDialog.value = false;
  priceToUpdate.value = {
    id: 0,
    price: 0,
    discount: 0,
    games_number: 0,
    total_price: 0,
    created_at: "",
    updated_at: "",
  };
};

const loadingUpdatePrice = ref(false);
const updatePriceForm = ref<VForm>();
const onUpdatePrice = async (
  id: number,
  priceData: {
    price: number;
    discount: number;
    games_number: number;
    total_price: number;
  }
) => {
  try {
    loadingUpdatePrice.value = true;
    await axios.post(`${API_BASE_URL}/api/prices/${id}`, priceData);
    await loadPrices({ page: 1, itemsPerPage: 10 });
    onCloseUpdatePriceDialog();
  } catch (err) {
    console.log(err);
  } finally {
    loadingUpdatePrice.value = false;
  }
};
const clickUpdatePrice = async (id: number) => {
  if (updatePriceForm.value) {
    const isValid = await updatePriceForm.value.validate();
    if (isValid) {
      await onUpdatePrice(id, {
        price: priceToUpdate.value.price,
        discount: priceToUpdate.value.discount,
        games_number: priceToUpdate.value.games_number,
        total_price: updatedTotalPrice.value,
      });
      priceToUpdate.value = {
        id: 0,
        price: 0,
        discount: 0,
        games_number: 0,
        total_price: 0,
        created_at: "",
        updated_at: "",
      };
    }
  }
};

const openDeletePriceDialog = ref(false);
const deletedPriceId = ref<number>();
const onOpenDeletePriceDialog = (id: number) => {
  deletedPriceId.value = id;
  openDeletePriceDialog.value = true;
};
const onCloseDeletePriceDialog = () => {
  openDeletePriceDialog.value = false;
  deletedPriceId.value = undefined;
};
const loadingDeletePriceDialog = ref(false);
const onDeletePrice = async (id?: number) => {
  try {
    loadingDeletePriceDialog.value = true;
    if (id) {
      await axios.delete(`${API_BASE_URL}/api/prices/${id}`);
      await loadPrices({ page: 1, itemsPerPage: 10 });
      openDeletePriceDialog.value = false;
    }
  } catch (err) {
    console.log(err);
  } finally {
    loadingDeletePriceDialog.value = false;
  }
};
</script>

<template>
  <BaseLayout>
    <template #title> {{ t("prices.title") }} </template>
    <template #createBtn>
      <v-btn
        color="primary"
        class="custom-btn"
        @click="onOpenCreatePriceDialog"
        prepend-icon="mdi-plus"
      >
        {{ t("prices.addPrice") }}
      </v-btn>
    </template>
    <div>
      <v-container>
        <AppHeader
          :title="t('prices.title')"
          :subtitle="t('prices.subtitle')"
        />
        <v-data-table-server
          :headers="tableHeaders"
          :items="prices"
          :items-length="totalPricesCount"
          :loading="loadingGetPrices"
          item-value="name"
          @update:options="loadPrices"
        >
          <template #item.actions="{ item }">
            <v-btn icon variant="text" @click="onOpenUpdatePriceDialog(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>

            <v-btn
              icon
              variant="text"
              color="error"
              @click="onOpenDeletePriceDialog(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table-server>
      </v-container>

      <!-- Create Price Dialog -->
      <v-dialog v-model="openCreatePriceDialog" max-width="500px">
        <v-card>
          <v-card-title class="font-weight-bold">
            {{ t("prices.addPrice") }}
          </v-card-title>
          <v-card-text>
            <v-form ref="createPriceForm" lazy-validation>
              <v-text-field
                v-model.number="price.price"
                :label="t('prices.table.headers.price')"
                :rules="[validateNumber]"
                type="number"
                variant="outlined"
                required
              ></v-text-field>
              <v-text-field
                v-model.number="price.discount"
                :label="t('prices.table.headers.discount')"
                :rules="[validateNumber]"
                type="number"
                variant="outlined"
                required
              ></v-text-field>
              <v-text-field
                v-model.number="price.games_number"
                :label="t('prices.table.headers.gamesNumber')"
                :rules="[validateNumber]"
                type="number"
                variant="outlined"
                required
              ></v-text-field>
              <div>
                <strong>{{ t("prices.table.headers.totalPrice") }}: </strong>
                {{ totalPrice }}
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseCreatePriceDialog">
              {{ t("form.cancel") }}
            </v-btn>
            <v-btn
              color="primary"
              @click="clickCreatePrice"
              :loading="loadingCreatePrice"
            >
              {{ t("form.save") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Update Price Dialog -->
      <v-dialog v-model="openUpdatePriceDialog" max-width="500px">
        <v-card>
          <v-card-title class="font-weight-bold">
            {{ t("prices.updatePrice") }}
          </v-card-title>
          <v-card-text>
            <v-form ref="updatePriceForm" lazy-validation>
              <v-text-field
                v-model.number="priceToUpdate.price"
                :label="t('prices.table.headers.price')"
                :rules="[validateNumber]"
                type="number"
                variant="outlined"
                required
              ></v-text-field>
              <v-text-field
                v-model.number="priceToUpdate.discount"
                :label="t('prices.table.headers.discount')"
                :rules="[validateNumber]"
                type="number"
                variant="outlined"
                required
              ></v-text-field>
              <v-text-field
                v-model.number="priceToUpdate.games_number"
                :label="t('prices.table.headers.gamesNumber')"
                :rules="[validateNumber]"
                type="number"
                variant="outlined"
                required
              ></v-text-field>
              <div>
                <strong>{{ t("prices.table.headers.totalPrice") }}: </strong>
                {{
                  priceToUpdate.price && priceToUpdate.discount
                    ? priceToUpdate.price -
                      priceToUpdate.price * (priceToUpdate.discount / 100)
                    : 0
                }}
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseUpdatePriceDialog">
              {{ t("form.cancel") }}
            </v-btn>
            <v-btn
              color="primary"
              @click="clickUpdatePrice(priceToUpdate.id)"
              :loading="loadingUpdatePrice"
            >
              {{ t("form.save") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Confirm Delete Dialog -->
      <v-dialog v-model="openDeletePriceDialog" max-width="500px">
        <v-card>
          <v-card-title class="font-weight-bold">
            {{ t("prices.deletePrice") }}
          </v-card-title>
          <v-card-text>
            {{ t("prices.confirmDeleteMessage") }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseDeletePriceDialog">
              {{ t("form.cancel") }}
            </v-btn>
            <v-btn
              color="error"
              @click="onDeletePrice(deletedPriceId)"
              :loading="loadingDeletePriceDialog"
            >
              {{ t("form.delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </BaseLayout>
</template>
