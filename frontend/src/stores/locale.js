import { defineStore } from 'pinia';
import { ref } from 'vue';
import en from '../locales/en.json';
import id from '../locales/id.json';

const LOCAL_STORAGE_KEY = 'ff_selected_locale';

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref(localStorage.getItem(LOCAL_STORAGE_KEY) || 'en');
  const messages = { en, id };

  function setLocale(locale) {
    if (messages[locale]) {
      currentLocale.value = locale;
      localStorage.setItem(LOCAL_STORAGE_KEY, locale);
      
      // Update HTML lang attribute for accessibility/SEO
      document.documentElement.setAttribute('lang', locale);
    }
  }

  // Initialize lang attribute on load
  document.documentElement.setAttribute('lang', currentLocale.value);

  function t(key, params = {}) {
    if (!key) return '';
    
    const keys = key.split('.');
    let value = messages[currentLocale.value];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to English if translation is missing in Indonesian
        let fallbackValue = messages['en'];
        for (const fk of keys) {
          if (fallbackValue && fallbackValue[fk] !== undefined) {
            fallbackValue = fallbackValue[fk];
          } else {
            fallbackValue = null;
            break;
          }
        }
        if (fallbackValue !== null) {
          value = fallbackValue;
          break;
        }
        return key; // return key itself as last resort
      }
    }

    if (typeof value === 'string') {
      // Simple interpolation for {paramName}
      return value.replace(/\{(\w+)\}/g, (_, k) => {
        return params[k] !== undefined ? params[k] : `{${k}}`;
      });
    }

    return key;
  }

  return {
    currentLocale,
    setLocale,
    t
  };
});
