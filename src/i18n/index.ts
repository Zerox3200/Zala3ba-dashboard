import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ar from './locales/ar.json'

export type Locale = 'en' | 'ar'

const messages = {
  en,
  ar
}

// Get the stored locale or default to 'en'
const getStoredLocale = (): Locale => {
  const stored = localStorage.getItem('locale')
  return (stored as Locale) || 'en'
}

// Set the stored locale
const setStoredLocale = (locale: Locale): void => {
  localStorage.setItem('locale', locale)
}

// Get the direction based on locale
const getDirection = (locale: Locale): 'ltr' | 'rtl' => {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

// Set document direction
const setDocumentDirection = (direction: 'ltr' | 'rtl'): void => {
  document.documentElement.dir = direction
  document.documentElement.lang = direction === 'rtl' ? 'ar' : 'en'
}

// Initialize document direction
setDocumentDirection(getDirection(getStoredLocale()))

export const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: getStoredLocale(),
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
  silentTranslationWarn: true,
  missingWarn: false,
  fallbackWarn: false
})

// Export utility functions
export const useI18nUtils = () => {
  const { locale } = i18n.global

  const changeLocale = (newLocale: Locale): void => {
    locale.value = newLocale
    setStoredLocale(newLocale)
    setDocumentDirection(getDirection(newLocale))
  }

  const toggleLocale = (): void => {
    const newLocale: Locale = locale.value === 'en' ? 'ar' : 'en'
    changeLocale(newLocale)
  }

  const getCurrentDirection = (): 'ltr' | 'rtl' => {
    return getDirection(locale.value as Locale)
  }

  const isRTL = (): boolean => {
    return getCurrentDirection() === 'rtl'
  }

  const getVuetifyLocale = (): string => {
    return locale.value === 'ar' ? 'ar' : 'en'
  }

  return {
    changeLocale,
    toggleLocale,
    getCurrentDirection,
    isRTL,
    getVuetifyLocale
  }
}

export default i18n
