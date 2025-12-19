<template>
  <div class="create-report">
    <base-title :title="isUpdate ? t('reports.edit_report') : t('reports.create_report')" :back="true"></base-title>
    <v-form @submit.prevent="handleSubmit" v-model="isValid">
      <v-card class="pa-4 overflow-visible card-wrapper">
        <v-row>
          <v-col cols="12" md="3">
            <base-input v-model="form.nameUz" :placeholder="t('halls.nameUz')" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="3">
            <base-input v-model="form.nameRu" :placeholder="t('halls.nameRu')" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="3">
            <base-input clearable v-model="form.nameEn" :placeholder="t('halls.nameEn')" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="3">
            <base-input clearable v-model="form.nameQr" :placeholder="t('halls.nameQr')" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea density="compact" color="indigo" rows="1" v-model="form.descriptionUz"
              :label="t('halls.descriptionUz')" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea density="compact" color="indigo" rows="1" v-model="form.descriptionRu"
              :label="t('halls.descriptionRu')" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea density="compact" color="indigo" rows="1" v-model="form.descriptionEn"
              :label="t('halls.descriptionEn')" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea density="compact" color="indigo" rows="1" v-model="form.descriptionQr"
              :label="t('halls.descriptionQr')" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="3" class="checkbox-wrapper">
            <span>{{ t('user.roles') }}</span>
            <v-checkbox color="primary" hide-details :label="t('for_admin')" v-model="form.isAdmin">
            </v-checkbox></v-col>
          <v-col cols="12" md="3" class="checkbox-wrapper">
            <v-checkbox color="primary" hide-details :label="t('for_cashier')" v-model="form.isCashier"></v-checkbox>
          </v-col>
          <v-col cols="12" md="3" class="checkbox-wrapper">
            <v-checkbox color="primary" hide-details :label="t('for_accountant')"
              v-model="form.isAccountant"></v-checkbox>
          </v-col>
          <v-col cols="12" md="3" class="checkbox-wrapper">
            <v-checkbox color="primary" hide-details :label="t('active')" v-model="form.isActive"></v-checkbox>
          </v-col>
          <v-col cols="12" md="4">
            <base-select :items="structures" v-model="form.structureId" :placeholder="t('directory.selectStructure')"
              :item-title="`name${capitalize(locale)}`" item-value="value" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="4" v-if="!isUpdate">
            <v-autocomplete :items="tables" density="compact" color="indigo" v-model="form.tableId"
              :placeholder="t('reports.choose_table')" :item-title="`name${currentLocale()}`" item-value="id" clearable
              :rules="[rules.required]" @update:model-value="handleTableSelect" />
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-start">
            <base-button type="submit" :disabled="!isValid" class="mr-2">{{
              isUpdate ? t('actions.edit') : t('actions.create')
            }}</base-button>
          </v-col>
          <v-col cols="12" md="4" v-if="selectedTable && !isUpdate">
            <h2>{{ t('selected_table') }}</h2>
            <div class="card">
              <span>
                {{
                  locale === 'ru' ? selectedTable.nameRu : locale === 'en' ? selectedTable.nameEn : selectedTable.nameUz
                }}
              </span>
              <v-btn @click="dialogRef.open(selectedTable)" color="indigo" density="compact" type="button"
                icon="mdi-pencil"></v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="12">
            <div class="plus-btn" v-if="form.tableId">
              <base-button type="button" @click="isListOpen = !isListOpen"><i
                  class="mdi mdi-plus text-h5"></i></base-button>
              <header-list-dropdown :column-list="columnList" v-if="isListOpen" @close="isListOpen = false" />
            </div>
          </v-col>
        </v-row>

        <template v-if="store.dynamicReportsColumns.length > 0">
          <v-divider class="my-4"></v-divider>
          <div class="grid-item">
            <template v-for="list in store.dynamicReportsColumns" :key="list.id">
              <div class="grid-inner">
                <div class="filter">
                  <span>{{ t('filter') }}</span>
                  <v-checkbox-btn hide-details color="primary" v-model="list.hasFilter"></v-checkbox-btn>
                </div>
                <checked-list @dragstart-event="handleDragStart" :list="list" />
              </div>
            </template>
          </div>
        </template>
      </v-card>
    </v-form>
    <div class="table-wrapper" @dragover.prevent @drop="handleDrop" ref="htmlContent">
      <hot-table ref="hotTableRef" :settings="settings" :afterChange="afterChange" :afterMergeCells="afterMergeCells"
        :key="tableKey"></hot-table>
    </div>
    <base-spinner v-if="loading" />
    <column-update-dialog ref="dialogRef" :tableUpdate="true" @updated="handleUpdated" />
  </div>
</template>

<script lang="ts" setup>
import { HotTable } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import { ruRU, registerLanguageDictionary } from 'handsontable/i18n'
import 'handsontable/dist/handsontable.full.min.css'

import {
  getTables,
  getColumnByTableId,
  createReportTemplate,
  getColumnsByIds,
  updateReportTemplate,
  getReportTemplatById
} from '@/services/dynamic-reports/dynamic-reports.service'
import { DynamicColumnModel, DynamicTableModel } from '@/services/dynamic-reports/model/dynamic-reports.model'
import { useDynamicReportsStore } from '@/stores/dynamic-reports.store'
import { getErrorMessage, currentLocale, sleep, capitalize, scrollTop } from '@/utils/functions'

import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { useRules } from '@/utils/rules'

import { getStructures } from '@/services/directory/directory.service'
import { useCashierStore } from '@/stores/cashier.store'

const props = defineProps<{ isUpdate?: boolean }>()
const htmlContent = ref<HTMLDivElement | null>(null)
const draggedItem = ref<DynamicColumnModel | null>(null)
const rules = useRules()
const hotTableRef = ref(null)
const html = ref('')
const maxRow = ref(0)
const maxCol = ref(0)
const isValid = ref(false)
const router = useRouter()
const { t, locale } = useI18n()
const tableKey = ref(0)
const isListOpen = ref(false)
const store = useDynamicReportsStore()
const structures = ref<any[]>([])

const dialogRef = ref()

const form = ref({
  structureId: null,
  nameRu: '',
  nameUz: '',
  nameEn: '',
  nameQr: '',
  descriptionUz: '',
  descriptionRu: '',
  descriptionEn: '',
  descriptionQr: '',
  tableId: undefined,
  isAccountant: false,
  isAdmin: false,
  isCashier: false,
  isActive: false
})

const loading = ref(false)
const columnList = ref<DynamicColumnModel[]>([])
const tables = ref<DynamicTableModel[]>([])
const collection = ref<any>([])

const mergeCellsArray = ref<any[]>([])
const table = ref<any>(null)
const route: any = useRoute()
const selectedTable = ref<any>(null)
const cashierStore = useCashierStore()

const settings = ref({
  data: Array.from({ length: 3 }, () => Array(5).fill('')),
  rowHeights: 40,
  mergeCells: [],
  contextMenu: true,
  manualRowResize: true,
  manualColumnResize: true,
  language: ruRU.languageCode,
  licenseKey: 'non-commercial-and-evaluation'
})

const handleTableSelect = async () => {
  await fetchColumnById()

  if (form.value.tableId) {
    selectedTable.value = tables.value.find((item) => item.id === form.value.tableId)
  }
}

const handleUpdated = async () => {
  await fetchDynamicTables()
  await handleTableSelect()
}

const afterMergeCells = (_: any, mergeParent: any) => {
  if (mergeParent) {
    const existingCellIndex = mergeCellsArray.value.findIndex(
      (cell) => cell.row === mergeParent.row && cell.col === mergeParent.col
    )

    if (existingCellIndex !== -1) {
      if (mergeCellsArray.value[existingCellIndex].rowspan === mergeParent.rowspan) {
        mergeCellsArray.value[existingCellIndex].colspan = mergeParent.colspan
      } else {
        mergeCellsArray.value.push(mergeParent)
      }
    } else {
      mergeCellsArray.value.push(mergeParent)
    }
  }
}

const afterChange = (changes: [number, number, string, string][]) => {
  if (changes) {
    const isThereName = changes.every((item) => item[3])

    changes.forEach((item) => {
      if (item[3]) return
      maxRow.value = Math.max(maxRow.value, item[0])
      maxCol.value = Math.max(maxCol.value, item[1])
    })

    if (isThereName) {
      const payload = {
        rowSpan: maxRow.value > 0 ? maxRow.value : changes[0][0],
        colSpan: maxCol.value > 0 ? maxCol.value : changes[0][1],
        nameRu: changes[0][3],
        nameUz: '',
        nameEn: '',
        hasFilter: false,
        filterInputType: null,
        id: 0
      }

      store.dynamicReportsColumns.push(payload)
      collection.value.push(payload)
      maxRow.value = 0
      maxCol.value = 0
    }
  }
}

const createHtml = () => {
  if (htmlContent.value) {
    const table = htmlContent.value.querySelector('table')
    const tbody = table?.querySelector('tbody')

    if (tbody) {
      const newThead = document.createElement('thead')
      const rows = tbody.querySelectorAll('tr')

      rows.forEach((row) => {
        const newRow = document.createElement('tr')

        Array.from(row.attributes).forEach((attr) => {
          newRow.setAttribute(attr.name, attr.value)
        })

        const cells = row.querySelectorAll('td')
        cells.forEach((cell) => {
          const newTh = document.createElement('th')

          if (cell.style.display !== 'none') {
            Array.from(cell.attributes).forEach((attr) => {
              newTh.setAttribute(attr.name, attr.value)
            })

            newTh.innerHTML = cell.innerHTML

            newRow.appendChild(newTh)
          }
        })

        newThead.appendChild(newRow)
      })

      tbody.remove()
      table?.appendChild(newThead)
      html.value = table?.outerHTML ?? ''
    }
  }
}

const handleSubmit = async () => {
  if (!isValid.value) return

  try {
    createHtml()
    setSelectFilters()

    checkHasFilter()

    console.log(collection.value)
    const payload = {
      ...form.value,
      html: html.value ?? '',
      isAscending: true,
      columns: collection.value ?? [],
      resource: JSON.stringify({ data: settings.value.data, mergeCells: mergeCellsArray.value }),
      actions: store.selectedActions,
      lang: locale.value
    }
    const { tableId, ...rest } = payload

    const { data } = props.isUpdate
      ? await updateReportTemplate({ ...rest, id: table.value.id })
      : await createReportTemplate(payload)

    if (data.result.success) {
      toast.success(props.isUpdate ? t('messages.updated_success') : t('messages.saved_success'))
      await sleep(2000)
      router.push('/reports/dynamic')
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    cashierStore.isReportsLoad = true
  }
}

const checkHasFilter = () => {
  store.dynamicReportsColumns.forEach((item) => {
    const index = collection.value.findIndex((el: any) => el.id === item.id)

    if (index !== -1) {
      collection.value[index] = {
        ...collection.value[index],
        hasFilter: item.hasFilter,
        filterInputType: item.typeName
      }
    }
  })
}

const handleDragStart = (list: DynamicColumnModel) => {
  draggedItem.value = list
}

const handleDrop = (event: DragEvent) => {
  const target = event.target as HTMLDivElement
  const parent = target.parentNode as HTMLDivElement

  const cellIndex = target.getAttribute('aria-colindex') ?? undefined
  const rowIndex = parent.getAttribute('aria-rowindex') ?? undefined

  if (cellIndex === undefined || rowIndex === undefined) return

  const coords = {
    coll: +cellIndex - 1,
    row: +rowIndex - 1
  }

  if (draggedItem.value) {
    settings.value.data[coords.row][coords.coll] = draggedItem.value.nameRu
    collection.value.push({
      id: draggedItem.value.id,
      nameUz: draggedItem.value.nameUz,
      nameEn: draggedItem.value.nameEn,
      nameRu: draggedItem.value.nameRu,
      rowSpan: coords.row,
      colSpan: coords.coll,
      hasFilter: draggedItem.value.hasFilter ?? false
    })
    draggedItem.value = null
  }
}

const getAllStructures = async () => {
  try {
    const { data } = await getStructures()
    structures.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchDynamicTables = async () => {
  try {
    loading.value = true
    const { data } = await getTables()
    tables.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const fetchColumnById = async () => {
  if (!form.value.tableId) return
  try {
    const { data } = await getColumnByTableId(form.value.tableId)
    columnList.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const getColumnsByColumnIds = async (ids: number[]) => {
  try {
    const { data } = await getColumnsByIds(ids)
    store.dynamicReportsColumns = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const getTableById = async () => {
  try {
    const { data } = await getReportTemplatById(route.params.id)
    table.value = data.result
    renderUpdate()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const renderUpdate = async () => {
  try {
    loading.value = true

    const columnIds = table.value?.columns?.filter((item: any) => item.id !== 0).map((item: any) => item.id) ?? []
    await getColumnsByColumnIds(columnIds)
    form.value = {
      ...form.value,
      structureId: table.value?.structureId ?? '',
      descriptionEn: table.value?.descriptionEn ?? '',
      descriptionUz: table.value?.descriptionUz ?? '',
      descriptionRu: table.value?.descriptionRu ?? '',
      descriptionQr: table.value?.descriptionQr ?? '',
      nameEn: table.value?.nameEn ?? '',
      nameUz: table.value?.nameUz ?? '',
      nameRu: table.value?.nameRu ?? '',
      nameQr: table.value?.nameQr ?? '',
      isAccountant: table.value?.isAccountant ?? false,
      isAdmin: table.value?.isAdmin ?? false,
      isCashier: table.value?.isCashier ?? false,
      isActive: table.value?.isActive ?? false
    }

    store.selectedActions = table.value?.actions ?? []

    collection.value = table.value?.columns
    store.dynamicReportsColumns = table.value?.columns

    const { data, mergeCells } = JSON.parse(table.value?.resource ?? '{"data":[], "mergeCells":[]}')
    settings.value.data = data
    settings.value.mergeCells = mergeCells
    mergeCellsArray.value = mergeCells
    tableKey.value++
    // @ts-ignore
    hotTableRef.value?.hotInstance?.render()
  } finally {
    loading.value = false
  }
}

const setSelectFilters = () => {
  store.columnFilters.forEach((item) => {
    const columnIndex = collection.value.findIndex((col: any) => col.id === item.columnId)
    if (!collection.value[columnIndex]) return
    collection.value[columnIndex] = {
      ...collection.value[columnIndex],
      hasFilter: true,
      filterInputType: item.filterInputType
    }
  })
}

registerAllModules()
registerLanguageDictionary(ruRU)
onMounted(async () => {
  scrollTop()
  await Promise.all([fetchDynamicTables(), getAllStructures()])
  if (props.isUpdate) {
    getTableById()
  }
})

onUnmounted(() => {
  store.dynamicReportsColumns = []
  store.selectedActions = []
  store.columnFilters = []
})
</script>

<style lang="scss">
.create-report {
  min-height: 200dvh;

  .card-wrapper {
    z-index: 50;
  }

  .table-report {
    border-collapse: collapse;
  }

  .table-responsive {
    overflow-x: auto;
    padding-bottom: 10px;
  }

  .grid-item {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1px;
  }

  .checkbox-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    &>span {
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
    }
  }

  .table-wrapper {
    margin: 16px 0;
    width: 100%;

    .wtHolder,
    .wtHider,
    .wtSpreader,
    .htCore {
      width: 99.9% !important;
    }

    td {
      font-size: 14px;
      font-weight: 500;
      text-align: center;
      line-height: 36px;
    }

    .wtHolder {
      height: auto !important;
    }
  }

  .plus-btn {
    position: relative;
    width: 100%;
    z-index: 50;
  }
}

body.dark-theme .table-wrapper {

  .handsontableInput,
  .htCore tbody td {
    background-color: rgb(33, 33, 33);
    color: #fff;
  }
}

.v-autocomplete--single:not(.v-autocomplete--selection-slot).v-text-field input {
  &::placeholder {
    opacity: 0.7;
  }
}

.grid-inner {
  display: flex;
  flex-direction: column;
  gap: 1px;

  .filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 3px 10px 3px 16px;
    outline: 1px solid rgb(223, 223, 223);
    font-size: 14px;

    .v-checkbox-btn {
      flex: 0;
    }
  }
}
</style>
