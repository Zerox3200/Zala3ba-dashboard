<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        class="language-switcher"
      >
        <v-icon class="mr-2">{{ currentLanguageIcon }}</v-icon>
        {{ currentLanguageName }}
        <v-icon class="ml-2">mdi-chevron-down</v-icon>
      </v-btn>
    </template>
    
    <v-list>
      <v-list-item
        v-for="locale in availableLocales"
        :key="locale.code"
        @click="changeLocale(locale.code)"
        :class="{ 'active': currentLocale === locale.code }"
      >
        <v-list-item-title class="d-flex align-center">
          <v-icon class="mr-2">{{ locale.icon }}</v-icon>
          {{ locale.name }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useI18nUtils, type Locale } from '../i18n'

const { t, locale } = useI18n()
const { changeLocale } = useI18nUtils()

const currentLocale = computed(() => locale.value as Locale)

const availableLocales = [
  {
    code: 'en' as Locale,
    name: t('language.en'),
    icon: 'mdi-flag'
  },
  {
    code: 'ar' as Locale,
    name: t('language.ar'),
    icon: 'mdi-flag'
  }
]

const currentLanguageName = computed(() => {
  const current = availableLocales.find(l => l.code === currentLocale.value)
  return current?.name || 'English'
})

const currentLanguageIcon = computed(() => {
  const current = availableLocales.find(l => l.code === currentLocale.value)
  return current?.icon || 'mdi-flag'
})
</script>

<style scoped>
.language-switcher {
  transition: all 0.3s ease;
}

.v-list-item.active {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
