import { DynamicColumnModel } from '@/services/dynamic-reports/model/dynamic-reports.model'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

export interface FilterModel {
  columnId: number
  filterInputType: number
}

export const useDynamicReportsStore = defineStore('dynamic-reports', () => {
  const { locale } = useI18n()

  const dynamicReportsColumns = ref<DynamicColumnModel[]>([])
  const selectedActions = ref<any[]>([])
  const columnFilters = ref<FilterModel[]>([])

  const currentColumnName = (list: DynamicColumnModel) => {
    switch (locale.value) {
      case 'ru':
        return list.nameRu
      case 'en':
        return list.nameEn
      case 'uz':
        return list.nameUz
      default:
        return list.nameRu
    }
  }

  const insertColumn = (column: DynamicColumnModel) => {
    // if includes add or remove
    if (dynamicReportsColumns.value.includes(column)) {
      dynamicReportsColumns.value = dynamicReportsColumns.value.filter((item) => item !== column)
    } else {
      dynamicReportsColumns.value.push(column)
    }
  }

  const removeColumn = (column: DynamicColumnModel) => {
    dynamicReportsColumns.value = dynamicReportsColumns.value.filter((item) => item.nameRu !== column.nameRu)
  }

  return {
    dynamicReportsColumns,
    currentColumnName,
    insertColumn,
    removeColumn,
    selectedActions,
    columnFilters
  }
})
