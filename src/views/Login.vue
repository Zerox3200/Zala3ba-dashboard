<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import type { LoginCredentials } from "../types";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const loginForm = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(
  null
);
const errorMessage = ref("");

const form = reactive({
  identifier: "",
  password: "",
});

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isPhone = (value: string) => {
  const normalized = value.replace(/[\s-]/g, "");
  return /^\+?\d{8,15}$/.test(normalized);
};

const identifierIcon = computed(() =>
  isEmail(form.identifier.trim())
    ? "mdi-email-outline"
    : isPhone(form.identifier.trim())
      ? "mdi-phone-outline"
      : "mdi-account-outline"
);

const identifierRules = [
  (v: string) => !!v?.trim() || t("login.errors.requiredIdentifier"),
  (v: string) =>
    isEmail(v.trim()) ||
    isPhone(v.trim()) ||
    t("login.errors.correctIdentifier"),
];

const passwordRules = [
  (v: string) => !!v || t("login.errors.requirePassword"),
  (v: string) => v.length >= 8 || t("login.errors.correctPassword"),
];

const buildCredentials = (): LoginCredentials => {
  const trimmed = form.identifier.trim();
  const password = form.password;

  if (isEmail(trimmed)) {
    return { email: trimmed, password };
  }

  return {
    phone_number: trimmed.replace(/[\s-]/g, ""),
    password,
  };
};

const handleLogin = async () => {
  if (!loginForm.value) return;
  const { valid } = await loginForm.value.validate();
  if (!valid) return;

  errorMessage.value = "";
  const result = await authStore.login(buildCredentials());
  if (result.success) {
    router.push("/categories");
  } else {
    errorMessage.value = result.message || t("login.errors.loginFailed");
  }
};
</script>

<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" style="min-height: 100vh">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="custom-card login-card" elevation="12">
          <v-card-text class="text-center pa-8">
            <div class="game-logo mb-6">
              <v-icon size="64" color="primary" class="mb-2">
                mdi-gamepad-variant
              </v-icon>
              <h1 class="gradient-text text-h3 font-weight-bold mb-2">
                {{ t("login.title") }}
              </h1>
              <h2 class="text-h5 font-weight-medium text-grey-darken-1">
                {{ t("login.subtitle") }}
              </h2>
              <div class="lightning-icons mt-2">
                <v-icon color="warning" class="lightning-icon mx-1">
                  mdi-lightning-bolt
                </v-icon>
                <v-icon color="error" class="lightning-icon mx-1">
                  mdi-lightning-bolt
                </v-icon>
              </div>
            </div>

            <v-form ref="loginForm" @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.identifier"
                :label="t('login.emailOrPhone')"
                :prepend-inner-icon="identifierIcon"
                variant="outlined"
                :rules="identifierRules"
                autocomplete="username"
                inputmode="text"
                required
                class="mb-4"
              />

              <v-text-field
                v-model="form.password"
                :label="t('login.password')"
                type="password"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                :rules="passwordRules"
                autocomplete="current-password"
                required
                class="mb-6"
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="custom-btn"
                :loading="authStore.loading"
                :disabled="authStore.loading"
              >
                <div
                  class="d-flex align-center justify-center"
                  style="gap: 10px"
                >
                  <v-icon>mdi-login</v-icon>
                  <span>{{ t("login.login") }}</span>
                </div>
              </v-btn>
            </v-form>

            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mt-4"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #ff6b35 0%, #d62828 100%);
  min-height: 100vh;
}

.login-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
}

.game-logo {
  position: relative;
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
