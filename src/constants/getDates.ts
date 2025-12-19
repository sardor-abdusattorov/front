import { useI18n } from 'vue-i18n'

export const getMonths = () => {
  const { t } = useI18n()
  return [
    { name: t('months.jan'), value: 1 },
    { name: t('months.feb'), value: 2 },
    { name: t('months.mar'), value: 3 },
    { name: t('months.apr'), value: 4 },
    { name: t('months.may'), value: 5 },
    { name: t('months.jun'), value: 6 },
    { name: t('months.jul'), value: 7 },
    { name: t('months.aug'), value: 8 },
    { name: t('months.sep'), value: 9 },
    { name: t('months.oct'), value: 10 },
    { name: t('months.nov'), value: 11 },
    { name: t('months.dec'), value: 12 }
  ]
}

export const getYears = () => {
  const years = []
  let now = new Date()
  let thisYear = now.getFullYear()
  
  for (let i = 2020; i <= thisYear + 1; i++) {
    years.push({ name: i, value: i })
  }

  return years
}