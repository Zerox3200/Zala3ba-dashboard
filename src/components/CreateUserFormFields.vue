<script setup lang="ts">
import { computed, ref } from "vue";
import type { CreateUserPayload } from "../types";
import { useI18n } from "vue-i18n";
import type { VForm } from "vuetify/lib/components/VForm";

const props = withDefaults(
  defineProps<{
    form: CreateUserPayload;
    getFieldError: (field: keyof CreateUserPayload) => string[];
    layout?: "desktop" | "mobile";
  }>(),
  { layout: "desktop" }
);

const showPassword = defineModel<boolean>("showPassword", { required: true });

const { t } = useI18n();
const formRef = ref<VForm>();
const mobileStep = ref(0);
const mobileSteps = 3;

const mobileStepLabels = computed(() => [
  t("users.dialog.sectionAccount"),
  t("users.dialog.sectionContact"),
  t("users.dialog.sectionGames"),
]);

const isLastMobileStep = computed(
  () => mobileStep.value === mobileSteps - 1
);

const requiredRule = (value: string) =>
  !!value?.toString().trim() || t("form.required");

const emailRule = (value: string) => {
  if (!value?.trim()) return t("users.validation.emailRequired");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value) || t("users.validation.emailInvalid");
};

const passwordRule = (value: string) => {
  if (!value?.trim()) return t("users.validation.passwordRequired");
  return value.length >= 6 || t("users.validation.passwordMinLength");
};

const availableGamesRule = (value: number) => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return t("users.validation.availableGamesRequired");
  }
  if (value < 0) return t("users.validation.availableGamesMin");
  return true;
};

const validateMobileStep = (step: number): boolean => {
  if (step === 0) {
    return (
      requiredRule(props.form.name) === true &&
      emailRule(props.form.email) === true &&
      passwordRule(props.form.password) === true
    );
  }
  if (step === 1) {
    return (
      requiredRule(props.form.country_code) === true &&
      requiredRule(props.form.phone_number) === true
    );
  }
  return availableGamesRule(props.form.available_games) === true;
};

const validateAllMobile = (): boolean => {
  for (let i = 0; i < mobileSteps; i++) {
    if (!validateMobileStep(i)) return false;
  }
  return true;
};

const nextMobileStep = async (): Promise<boolean> => {
  const { valid } = (await formRef.value?.validate()) ?? { valid: false };
  if (!valid) return false;

  const ok = validateMobileStep(mobileStep.value);
  if (ok && mobileStep.value < mobileSteps - 1) {
    mobileStep.value += 1;
  }
  return ok;
};

const prevMobileStep = () => {
  if (mobileStep.value > 0) mobileStep.value -= 1;
};

const resetMobile = () => {
  mobileStep.value = 0;
};

const goToMobileStep = (step: number) => {
  mobileStep.value = Math.max(0, Math.min(step, mobileSteps - 1));
};

const validate = async () => {
  if (props.layout === "mobile") {
    return { valid: validateAllMobile() };
  }
  return formRef.value?.validate();
};

defineExpose({
  validate,
  mobileStep,
  isLastMobileStep,
  nextMobileStep,
  prevMobileStep,
  resetMobile,
  goToMobileStep,
});
</script>

<template>
  <v-form
    ref="formRef"
    class="create-user-form"
    :class="{ 'create-user-form--mobile': layout === 'mobile' }"
    @submit.prevent
  >
    <!-- Desktop layout -->
    <template v-if="layout === 'desktop'">
      <p class="form-section-label text-overline mb-2">
        {{ t("users.dialog.sectionAccount") }}
      </p>
      <v-sheet rounded="lg" border class="form-section pa-4 mb-5">
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              :label="t('users.dialog.name')"
              :rules="[requiredRule]"
              :error-messages="getFieldError('name')"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              autocomplete="name"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.email"
              :label="t('users.dialog.email')"
              :rules="[emailRule]"
              :error-messages="getFieldError('email')"
              prepend-inner-icon="mdi-email-outline"
              type="email"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              autocomplete="email"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="form.password"
              :label="t('users.dialog.password')"
              :rules="[passwordRule]"
              :error-messages="getFieldError('password')"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              prepend-inner-icon="mdi-lock-outline"
              :hint="t('users.dialog.passwordHint')"
              persistent-hint
              variant="outlined"
              density="comfortable"
              autocomplete="new-password"
              @click:append-inner="showPassword = !showPassword"
            />
          </v-col>
        </v-row>
      </v-sheet>

      <p class="form-section-label text-overline mb-2">
        {{ t("users.dialog.sectionContact") }}
      </p>
      <v-sheet rounded="lg" border class="form-section pa-4 mb-5">
        <v-row dense>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="form.country_code"
              :label="t('users.dialog.countryCode')"
              :rules="[requiredRule]"
              :error-messages="getFieldError('country_code')"
              prepend-inner-icon="mdi-earth"
              :hint="t('users.dialog.countryCodeHint')"
              persistent-hint
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="form.phone_number"
              :label="t('users.dialog.phoneNumber')"
              :rules="[requiredRule]"
              :error-messages="getFieldError('phone_number')"
              prepend-inner-icon="mdi-phone-outline"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              autocomplete="tel"
            />
          </v-col>
        </v-row>
      </v-sheet>

      <p class="form-section-label text-overline mb-2">
        {{ t("users.dialog.sectionGames") }}
      </p>
      <v-sheet rounded="lg" border class="form-section pa-4">
        <v-text-field
          v-model.number="form.available_games"
          :label="t('users.dialog.availableGames')"
          :rules="[availableGamesRule]"
          :error-messages="getFieldError('available_games')"
          prepend-inner-icon="mdi-gamepad-variant-outline"
          type="number"
          min="0"
          variant="outlined"
          density="comfortable"
          hide-details="auto"
        />
      </v-sheet>
    </template>

    <!-- Mobile: one step per screen, no scroll -->
    <template v-else>
      <div class="mobile-form-intro">
        <h2 class="text-h6 font-weight-bold mb-1">
          {{ t("users.dialog.createTitle") }}
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ t("users.dialog.createSubtitle") }}
        </p>
      </div>

      <div class="mobile-stepper">
        <div
          v-for="(_, index) in mobileSteps"
          :key="index"
          class="mobile-stepper__item"
          :class="{
            'mobile-stepper__item--active': mobileStep === index,
            'mobile-stepper__item--done': mobileStep > index,
          }"
        >
          <div class="mobile-stepper__dot">
            <v-icon v-if="mobileStep > index" size="14" color="white">
              mdi-check
            </v-icon>
            <span v-else class="text-caption font-weight-bold">{{
              index + 1
            }}</span>
          </div>
          <span class="mobile-stepper__label text-caption">{{
            mobileStepLabels[index]
          }}</span>
        </div>
      </div>

      <p class="mobile-step-title text-subtitle-2 font-weight-bold mb-3">
        {{ mobileStepLabels[mobileStep] }}
      </p>

      <!-- Step 1: Account -->
      <div v-show="mobileStep === 0" class="mobile-step-fields">
        <v-text-field
          v-model="form.name"
          :label="t('users.dialog.name')"
          :rules="[requiredRule]"
          :error-messages="getFieldError('name')"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          density="compact"
          hide-details="auto"
          autocomplete="name"
        />
        <v-text-field
          v-model="form.email"
          :label="t('users.dialog.email')"
          :rules="[emailRule]"
          :error-messages="getFieldError('email')"
          prepend-inner-icon="mdi-email-outline"
          type="email"
          variant="outlined"
          density="compact"
          class="mt-2"
          hide-details="auto"
          autocomplete="email"
        />
        <v-text-field
          v-model="form.password"
          :label="t('users.dialog.password')"
          :rules="[passwordRule]"
          :error-messages="getFieldError('password')"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          density="compact"
          class="mt-2"
          hide-details="auto"
          autocomplete="new-password"
          @click:append-inner="showPassword = !showPassword"
        />
      </div>

      <!-- Step 2: Contact -->
      <div v-show="mobileStep === 1" class="mobile-step-fields">
        <v-row dense class="ma-0">
          <v-col cols="4" class="ps-0">
            <v-text-field
              v-model="form.country_code"
              :label="t('users.dialog.countryCode')"
              :rules="[requiredRule]"
              :error-messages="getFieldError('country_code')"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="8" class="pe-0">
            <v-text-field
              v-model="form.phone_number"
              :label="t('users.dialog.phoneNumber')"
              :rules="[requiredRule]"
              :error-messages="getFieldError('phone_number')"
              prepend-inner-icon="mdi-phone-outline"
              variant="outlined"
              density="compact"
              hide-details="auto"
              autocomplete="tel"
            />
          </v-col>
        </v-row>
      </div>

      <!-- Step 3: Games + summary -->
      <div v-show="mobileStep === 2" class="mobile-step-fields">
        <v-sheet rounded="lg" class="mobile-summary pa-3 mb-3" border>
          <p class="text-caption text-medium-emphasis mb-1">
            {{ t("users.dialog.mobileReview") }}
          </p>
          <p class="text-body-2 font-weight-medium mb-0 text-truncate">
            {{ form.name }}
          </p>
          <p class="text-caption text-medium-emphasis mb-0 text-truncate">
            {{ form.email }}
          </p>
          <p class="text-caption mb-0">
            {{ form.country_code }} {{ form.phone_number }}
          </p>
        </v-sheet>
        <v-text-field
          v-model.number="form.available_games"
          :label="t('users.dialog.availableGames')"
          :rules="[availableGamesRule]"
          :error-messages="getFieldError('available_games')"
          prepend-inner-icon="mdi-gamepad-variant-outline"
          type="number"
          min="0"
          variant="outlined"
          density="compact"
          hide-details="auto"
        />
      </div>
    </template>
  </v-form>
</template>

<style scoped>
.form-section {
  background: #fff;
}

.form-section-label {
  color: rgba(0, 0, 0, 0.55);
  letter-spacing: 0.08em;
  font-weight: 600;
}

.create-user-form--mobile {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.mobile-stepper {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 16px;
}

.mobile-stepper__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.mobile-stepper__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.45);
  transition: background 0.2s, color 0.2s;
}

.mobile-stepper__item--active .mobile-stepper__dot {
  background: linear-gradient(135deg, #ff6b35 0%, #d62828 100%);
  color: #fff;
}

.mobile-stepper__item--done .mobile-stepper__dot {
  background: #2e7d32;
  color: #fff;
}

.mobile-stepper__label {
  color: rgba(0, 0, 0, 0.45);
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-stepper__item--active .mobile-stepper__label {
  color: #d62828;
  font-weight: 600;
}

.mobile-step-title {
  color: rgba(0, 0, 0, 0.75);
}

.mobile-step-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mobile-summary {
  background: #fff;
}

.mobile-form-intro {
  margin-bottom: 16px;
}
</style>
