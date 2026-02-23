<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import type { LoginCredentials, RegisterData } from "../types";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const loginForm = ref<any>(null);
const errorMessage = ref<string>("");

const form = reactive<LoginCredentials>({
  email: "",
  password: "",
});

// قواعد التحقق
const emailRules = [
  (v: string) => !!v || t("login.errors.requiredEmail"),
  (v: string) => /.+@.+\..+/.test(v) || t("login.errors.correctEmail"),
];

const passwordRules = [
  (v: string) => !!v || t("login.errors.requirePassword"),
  (v: string) => v.length >= 8 || t("login.errors.correctPassword"),
];

const handleLogin = async (): Promise<void> => {
  const { valid } = await loginForm.value.validate();
  if (!valid) return;

  const result = await authStore.login(form);
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
            <!-- شعار/عنوان اللعبة -->
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
                <v-icon color="warning" class="lightning-icon mx-1"
                  >mdi-lightning-bolt</v-icon
                >
                <v-icon color="error" class="lightning-icon mx-1"
                  >mdi-lightning-bolt</v-icon
                >
              </div>
            </div>

            <!-- نموذج تسجيل الدخول -->
            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <v-text-field
                v-model="form.email"
                :label="t('login.email')"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                :rules="emailRules"
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
                  <span>{{ t("login.title") }}</span>
                </div>
              </v-btn>
            </v-form>

            <!-- رسالة الخطأ -->
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
