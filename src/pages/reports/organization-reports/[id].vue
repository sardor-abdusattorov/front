<template>
  <v-card class="w-100 py-4 px-6" v-if="!isLoading">
    <base-title :title="tableTitle">
      <template #actions>
        <base-button :loading="buttonLoading" @click="fetchCreateUserReports(true, true)" v-if="htmlTable"
          prepend-icon="mdi-microsoft-excel">
          {{ t('downExcel') }}
        </base-button>
      </template>
    </base-title>
    <template v-if="filterWithTypes.length > 0">
      <h2 class="filter-title">{{ t('report.added_filters') }}</h2>
      <v-row class="mb-4">
        <template v-for="filter in filters.map((filter) => ({ ...filter, value: null }))" :key="filter.id">
          <v-col cols="12" md="3" sm="6" v-if="
            filter.filterInputType === 'reference' ||
            filter.filterInputType === 'String' ||
            filter.filterInputType === 'DateTime'
          ">
            <!-- <base-select :items="filter.items" v-if="filter.filterInputType === 'reference'" :placeholder="filter.nameRu"></base-select> -->
            <base-input :placeholder="filter.nameRu" v-model="filter.value"
              @update:model-value="updateFilterValue(filter.id, $event)" v-if="filter.filterInputType === 'String'" />
            <base-date-input :placeholder="filter.nameRu" v-model="filter.value"
              @update:model-value="updateFilterValue(filter.id, $event)" v-if="filter.filterInputType === 'DateTime'" />
          </v-col>
        </template>
      </v-row>
    </template>

    <div class="table-responsive" v-html="htmlTable" />
    <v-pagination v-if="pagination && pagination.total > 1" class="base-pagination" rounded="circle"
      density="comfortable" active-color="#8e24aa" total-visible="5" :value:model-value="pagination.page"
      :length="pagination.total" @update:model-value="pagination.pageClickHandler($event)"></v-pagination>
  </v-card>
  <base-spinner v-else />
</template>

<script lang="ts" setup>
import * as XLSX from 'xlsx'
import { PERMISSIONS } from '@/constants/permissions'
import { createUserReport } from '@/services/dynamic-reports/dynamic-reports.service'
import { base64ToBlob, downloadBlobAsFile, getErrorMessage } from '@/utils/functions'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import { FilterReportsModel } from '@/services/dynamic-reports/model/dynamic-reports.model'

const route: any = useRoute()
const currentPage = ref(0)
const pagination = ref({
  page: 0,
  total: 0,
  pageClickHandler: (page: number) => {
    currentPage.value = page - 1
    fetchCreateUserReports()
  }
})

const { t } = useI18n()
const isLoading = ref(false)
const htmlTable = ref('')
const tableTitle = ref('')
const filters = ref<FilterReportsModel[]>([])
const buttonLoading = ref(false)

const filterWithTypes = computed(() => {
  return filters.value.filter((filter) => filter.filterInputType)
})

const addedFilters = ref<{ columnId: number; value: any }[]>([])

const fetchCreateUserReports = async (isDownload = false, isAll = false) => {
  if (isAll) {
    buttonLoading.value = true
  }
  try {
    const { data } = await createUserReport({
      id: +route.params.id,
      skip: currentPage.value,
      take: 10,
      filters: addedFilters.value,
      isAll
    })

    const blob = base64ToBlob(data.result.file?.fileContents, data.result?.file?.contentType)
    filters.value = data.result?.info?.filters
    pagination.value.total = data.result?.info?.count ? Math.ceil(data.result?.info?.count / 10) : 0
    isDownload
      ? downloadBlobAsFile(blob, `${data.result.file?.fileDownloadName || 'Report'}.xlsx`)
      : await createHtml(blob)
  } catch (err) {
    toast.error(getErrorMessage(err))
  } finally {
    buttonLoading.value = false
  }
}

const createHtml = async (blob: Blob) => {
  htmlTable.value = ''

  const arrayBuffer = await blob.arrayBuffer()

  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  htmlTable.value = XLSX.utils.sheet_to_html(worksheet)

  getTableTitle()
}

const getTableTitle = () => {
  const tableParentElement = document.createElement('div')
  tableParentElement.classList.add('table-parent')
  tableParentElement.innerHTML = htmlTable.value
  const table = tableParentElement.querySelector('table')
  if (!table) return
  const trs = table.querySelectorAll('tbody tr')
  const title = trs[0]?.querySelector('td')

  tableTitle.value = title?.textContent || ''
}

const updateFilterValue = async (id: number, value: any) => {
  console.log(id, value)
  const payload = {
    columnId: id,
    value: [value]
  }

  const index = addedFilters.value.findIndex((item) => item.columnId === id)

  if (index === -1) {
    addedFilters.value.push(payload)
  } else {
    addedFilters.value[index] = payload
  }

  await fetchCreateUserReports()
}

const load = async () => {
  try {
    isLoading.value = true
    await fetchCreateUserReports()
  } finally {
    isLoading.value = false
  }
}

onMounted(load)

watch(
  () => route.params.id,
  () => {
    htmlTable.value = ''
    tableTitle.value = ''
    filters.value = []
    load()
  }
)

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS
  }
})
</script>

<style lang="scss">
.table-responsive {
  overflow-x: auto;

  table {
    border-collapse: collapse;
    width: 100%;
  }

  tr {
    min-height: 41px;
  }

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px 16px;
  }

  tbody tr:nth-child(1) {
    display: none;
  }
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;

  & .filter {
    padding: 6px 12px;
    border: 1px solid #00c7c2;
    border-radius: 6px;
    font-size: 12px;
    background-color: #00c7c2;
    color: white;
  }
}

.filter-title {
  font-size: 18px;
  margin-bottom: 6px;
}
</style>
