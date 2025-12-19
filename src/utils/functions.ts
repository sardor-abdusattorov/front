import moment from 'moment-timezone'
import { STRUCTURES } from '@/constants/structures'
import { useI18n } from 'vue-i18n'

export const guessedTimeZone = moment.tz.guess()

export const filterFalsyValues = <T extends Record<string, any>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (v === 0) return true
      if (v) return true
    })
  ) as Partial<T>
}

export function formatMoney(amount: number, decimalCount = 0, decimal = '', thousands = ' ') {
  try {
    decimalCount = Math.abs(decimalCount)
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount

    const negativeSign = amount < 0 ? '-' : ''

    const i = parseInt(Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString()
    const j = i.length > 3 ? i.length % 3 : 0

    return (
      negativeSign +
      (j ? i.slice(0, j) + thousands : '') +
      i.slice(j).replace(/(\d{3})(?=\d)/g, `$1${thousands}`) +
      (decimalCount
        ? decimal +
        Math.abs(amount - +i)
          .toFixed(decimalCount)
          .slice(2)
        : '')
    )
  } catch (e) {
    console.error(e)
  }
}

export const sleep = (timeout: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

export const debounce = (cb: any, delay: number) => {
  let timer: any
  const customThis: any = this
  return function (...args: any) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      cb.apply(customThis, args)
    }, delay)
  }
}

export const isDev = () => {
  return import.meta.env.VITE_ENV_MODE === 'dev'
}

export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message
  }
  return 'Error ' + error
}

export const scrollTop = () => {
  const el = document.querySelector('.app-main')

  if (el) {
    el.scroll({ top: 0, behavior: 'instant' })
  }
}

export const setCurrentDate = () => {
  return moment.tz(guessedTimeZone).endOf('day').toDate()
}

export const setDayBefore = () => {
  return moment.tz(guessedTimeZone).subtract(31, 'day').startOf('day').toDate()
}

export const add5MoreHours = (date: Date) => {
  return moment(date).add(5, 'hours').toDate()
}

export const getDayFromDateRange = () => {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 0, 0))

  return {
    from: startOfDay,
    to: endOfDay
  }
}

export const downloadBlobAsFile = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadBlobAsPdf = (blob: Blob, fileName: string): void => {
  const b = new Blob([blob], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(b)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const printBlobContent = (blob: Blob): void => {
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url

  document.body.appendChild(iframe)

  iframe.onload = () => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)

    setTimeout(() => {
      document.body.removeChild(iframe)
    }, /** 30 sec */ 30000)
  }
}

export const getFormData = (data: any) => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (value !== null) {
      formData.append(key, value as string)
    }
  }
  return formData
}

export function formatDateTime(dateString: string | Date) {
  const date = new Date(dateString)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based, so add 1
  const day = String(date.getDate()).padStart(2, '0')

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function formatToBackend(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

export const structureChecker = {
  isMuseum(structureId: number) {
    return structureId === STRUCTURES.MUZEY
  },
  isTheatre(structureId: number) {
    return structureId === STRUCTURES.TEATR
  },
  isAgent(structureId: number) {
    return structureId === STRUCTURES.AGENT
  },
  isOrganizer(structureId: number) {
    return structureId === STRUCTURES.ORGANIZER
  },
  isEmitent(structureId: number) {
    return structureId === STRUCTURES.EMITENT
  }
}

export const currentLocale = (): string => {
  const { locale } = useI18n()
  return locale.value[0].toUpperCase() + locale.value.slice(1) || 'Ru'
}

export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function base64ToBlob(
  base64String: string,
  contentType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
) {
  const byteCharacters = atob(base64String)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)

  return new Blob([byteArray], { type: contentType })
}
