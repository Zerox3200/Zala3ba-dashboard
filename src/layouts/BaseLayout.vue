<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../stores/auth";

import LanguageSwitcher from "../components/LanguageSwitcher.vue";

// handle transaltion
const { t } = useI18n();

// handle drawer
const drawer = ref(true);

// handle logout
const router = useRouter();
const authStore = useAuthStore();
const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
};
</script>

<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer">
      <v-list-item class="pa-4">
        <v-list-item-content>
          <div class="text-center">
            <v-icon size="48" color="primary" class="mb-2">
              mdi-gamepad-variant
            </v-icon>
            <h2 class="gradient-text text-h5 font-weight-bold">
              {{ t("app.game") }}
            </h2>
            <p class="text-caption text-grey-darken-1">
              {{ t("app.adminPanel") }}
            </p>
          </div>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <!-- Nav List -->
      <v-list density="compact" nav>
          <v-list-item
          prepend-icon="mdi-earth"
          :title="t('navigation.countries')"
          value="countries"
          @click="$router.push('/countries')"
          :active="$route.path === '/countries'"
          class="custom-list-item"
        />
        <v-list-item
          prepend-icon="mdi-folder-multiple"
          :title="t('navigation.categories')"
          value="categories"
          @click="$router.push('/categories')"
          :active="$route.path === '/categories'"
          class="custom-list-item"
        />
        <v-list-item
          prepend-icon="mdi-account-multiple"
          :title="t('navigation.users')"
          value="users"
          @click="$router.push('/users')"
          :active="$route.path === '/users'"
          class="custom-list-item"
        />
        <v-list-item
          prepend-icon="mdi-cash-multiple"
          :title="t('navigation.payments')"
          value="payments"
          @click="$router.push('/payments')"
          :active="$route.path === '/payments'"
          class="custom-list-item"
        />
        <v-list-item
          prepend-icon="mdi-cellphone-cog"
          :title="t('navigation.versions')"
          value="versions"
          @click="$router.push('/versions')"
          :active="$route.path === '/versions'"
          class="custom-list-item"
        />
        <v-list-item
          prepend-icon="mdi-currency-usd"
          :title="t('navigation.prices')"
          value="prices"
          @click="$router.push('/prices')"
          :active="$route.path === '/prices'"
          class="custom-list-item"
        />
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-btn
            color="error"
            variant="outlined"
            block
            @click="handleLogout"
            :loading="authStore.loading"
          >
            <v-icon left>mdi-logout</v-icon>
            {{ t("navigation.logout") }}
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app elevation="0" class="custom-app-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title class="gradient-text font-weight-bold">
        <slot name="title" />
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <LanguageSwitcher />

      <slot name="createBtn" />
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="custom-main">
      <slot />
    </v-main>
  </v-app>
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
