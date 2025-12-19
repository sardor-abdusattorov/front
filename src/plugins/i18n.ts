import { createI18n } from 'vue-i18n'
import ru from '@/locales/ru.json'
import uz from '@/locales/uz.json'
import en from '@/locales/en.json'
import qr from '@/locales/kar.json'

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('lang') || 'ru',
  fallbackLocale: ['uz', 'ru', 'en', 'qr'],
  missingWarn: false,
  fallbackWarn: false,


  messages: { uz, ru, en, qr }
})
