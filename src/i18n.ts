import { createI18n } from 'vue-i18n';
import es from './locales/es';
import en from './locales/en';

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'es', // Default locale
  fallbackLocale: 'en',
  messages: {
    es,
    en
  }
});

export default i18n;
