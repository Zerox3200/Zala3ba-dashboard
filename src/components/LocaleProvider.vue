<template>
  <v-locale-provider :locale="currentVuetifyLocale">
    <slot />
  </v-locale-provider>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useI18nUtils } from '../i18n'

const { locale } = useI18n()
const { getVuetifyLocale } = useI18nUtils()

const currentVuetifyLocale = computed(() => getVuetifyLocale())

// Watch for locale changes and update document direction
watch(locale, (newLocale) => {
  const direction = newLocale === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = direction
  document.documentElement.lang = newLocale
}, { immediate: true })
</script>
