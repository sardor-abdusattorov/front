import { useI18n } from 'vue-i18n'

export const useRules = () => {
  const { t } = useI18n()

  const rules = {
    required: (value: string | number) =>
      (value !== null && value !== undefined && value !== '') || t('rules.required'),
    imageRequired: (value: any) => !value || t('rules.required'),
    min: (value: string) => (value && value.length >= 3) || t('rules.min'),
    phoneRule: (value: string) => (value && value.length >= 12) || value?.length < 1 || t('rules.phone'),
    okedRule: (value: string) => (value && value.length === 5) || t('rules.oked'),
    okonxRule: (value: string) => (value && value.length === 4) || t('rules.okonx'),
    innRule: (value: string) => (value && value.length === 9) || t('rules.inn'),
    emailRules: (value: string) => {
      if (/.+@.+\..+/.test(value)) return true
      return t('rules.email')
    },
    rulesHours: (v: any) => {
      if (!v) return t('rules.required_short')
      if (v.length > 2) return t('rules.hours_min')
      if (v.length < 2) return t('rules.hours_min')
      const digit = parseInt(v, 10)
      if (digit < 0 || digit > 23) return t('rules.hours_between')
      return true
    },
    rulesMinutes: (v: any) => {
      if (!v) return t('rules.required_short')
      if (v.length > 2) return t('rules.minutes_min')
      if (v.length < 2) return t('rules.minutes_min')
      const digit = parseInt(v, 10)
      if (digit < 0 || digit > 59) return t('rules.minutes_between')
      return true
    },
    rulesWebsite: (v: any) => {
      const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$', // fragment locator
        'i'
      )
      if (v.length && !pattern.test(v)) return t('rules.website')
      return true
    }
  }

  return rules
}
