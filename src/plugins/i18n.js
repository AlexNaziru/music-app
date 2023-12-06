import { createI18n } from 'vue-i18n'
import en from '../locale/en.json'
import ro from '../locale/ro.json'

export default createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    ro
  },
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'USD'
      }
    },
    ro: {
      currency: {
        style: 'currency',
        currency: 'RON'
      }
    }
  }
})
