<template>
  <base-page-layout :title="t('reports.reportByEvent')" :isLoading="loading">
    <template #filter>
      <v-card class="pa-4">
        <v-row>
          <v-col cols="12" md="3">
            <base-select :items="filterItems" item-value="value" item-title="name" v-model="itemDate"
              :label="t('report.dateType')" />
          </v-col>
          <v-col cols="12" md="3" v-if="itemDate === 'interval'" class="base-select">
            <div class="base-date-input">
              <label class="base-date-input__label">{{ t('tickets.selectDate') }}</label>
              <v-date-input :label="t('tickets.selectDate')" color="indigo" clearable multiple="range" density="compact"
                :value="dateView" @update:model-value="handleDateChange($event)" @click:clear="handleClear"
                prepend-icon="" prepend-inner-icon="mdi-calendar" :key="key" />
            </div>
          </v-col>
          <template v-if="itemDate === 'month'">
            <v-col cols="12" md="3">
              <base-select :items="years" item-value="value" item-title="name" v-model="filter.year"
                :label="t('year')" />
            </v-col>
            <v-col cols="12" md="3">
              <base-select :items="months" item-value="value" item-title="name" v-model="filter.month"
                :label="t('month')" />
            </v-col>
          </template>
          <v-col cols="12" md="3">
            <base-select v-if="companies?.length > 0" :items="companies" item-value="value" item-title="text"
              v-model="filter.orgId" :label="t('contract.organization')" />
          </v-col>
          <v-col cols="12" md="3">
            <base-select multiple v-if="events?.length > 0" :items="events" item-value="value" item-title="text"
              v-model="filter.eventIdList" :label="t('tickets.event')" />
          </v-col>
          <v-col cols="12" md="12" class="d-flex justify-end align-end">
            <base-button v-if="tableData.length > 0" @click="downloadExcel" prepend-icon="mdi-microsoft-excel">
              {{ t('downExcel') }}
            </base-button>
          </v-col>
        </v-row>
      </v-card>
    </template>
    <template #content>
      <ReportTabelByEvent :table-data="tableData" :skip="filter.skip" :take="filter.take" :total="total"
        @fetch="pageClickHandler($event)" />
      <base-empty class="empty" v-if="tableData.length === 0 && !loading" />
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import dayjs from 'dayjs'

import { PERMISSIONS } from '@/constants/permissions'
import { getMonths, getYears } from '@/constants/getDates'
import { downloadBlobAsFile, getErrorMessage } from '@/utils/functions'
import { getReportByEvent, getReportByEventExel } from '@/services/report-by-month'
import { getAllEventListBySaleDate, getCompanyAllList } from '@/services/organization/organization.service'
import { DATE_VIEW_FORMAT } from '@/constants/formats'

const { t } = useI18n()
const dateView = ref<string>('')
const key = ref(0)
const months = ref(getMonths())
const years = ref(getYears())
const companies = ref()
const events = ref([])
const tableData = ref<any>([])
const total = ref(0)
const loading = ref(false)
const itemDate = ref('interval')

const filterItems = [
  { name: t('byInterval'), value: 'interval' },
  { name: t('byMonth'), value: 'month' }
]

const filter = ref({
  year: null,
  month: null,
  byMonth: false,
  skip: 0,
  take: 10,
  startDate: '',
  endDate: '',
  orgId: '',
  eventIdList: [],
  date: [] as string[]
})

const handleDateChange = (date: string[] | string) => {
  filter.value.date = date as string[]
  dateView.value =
    dayjs(date[0]).format(DATE_VIEW_FORMAT) + ' - ' + dayjs(date[date.length - 1]).format(DATE_VIEW_FORMAT)
}

const handleClear = () => {
  filter.value.date = []
  dateView.value = ''
  key.value++
}

const structureDate = (day: string) =>
  `${day}.${filter.value.month! > 9 ? filter.value.month : `0${filter.value.month}`}.${filter.value.year}`

const fetchReportsByMonth = async () => {
  loading.value = true
  tableData.value = []

  const dateRange =
    itemDate.value === 'interval'
      ? {
        startDate: dayjs(filter.value.date[0]).format('DD.MM.YYYY'),
        endDate: dayjs(filter.value.date[filter.value.date.length - 1]).format('DD.MM.YYYY')
      }
      : {
        startDate: structureDate('01'),
        endDate: structureDate(filter.value.month === 2 ? '28' : '30')
      }

  try {
    const { data } = await getReportByEvent({ ...filter.value, ...dateRange })
    tableData.value = data.result.data
    total.value = data.result.total
  } catch (err) {
    toast.error(getErrorMessage(err))
  } finally {
    loading.value = false
  }
}

const downloadExcel = async () => {
  const dateRange =
    itemDate.value === 'interval'
      ? {
        startDate: dayjs(filter.value.date[0]).format('DD.MM.YYYY'),
        endDate: dayjs(filter.value.date[filter.value.date.length - 1]).format('DD.MM.YYYY')
      }
      : {
        startDate: structureDate('01'),
        endDate: structureDate(filter.value.month === 2 ? '28' : '30')
      }

  try {
    const { data } = await getReportByEventExel({ ...filter.value, ...dateRange })
    downloadBlobAsFile(data, 'ReportsByEvent.xlsx')
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getCompanies = async () => {
  const { data } = await getCompanyAllList()
  companies.value = data.result
}

const getEventList = async () => {
  const dateRange =
    itemDate.value === 'interval'
      ? {
        startDate: dayjs(filter.value.date[0]).format('DD.MM.YYYY'),
        endDate: dayjs(filter.value.date[filter.value.date.length - 1]).format('DD.MM.YYYY')
      }
      : {
        startDate: structureDate('01'),
        endDate: structureDate(filter.value.month === 2 ? '28' : '30')
      }

  try {
    const { data } = await getAllEventListBySaleDate({
      OrgId: filter.value.orgId,
      ...dateRange
    })
    events.value = data.result
    if (events.value.length === 0) {
      toast.warning(t('directory.organizationNotHaveEvent'))
    } else if (filter.value.eventIdList.length > 0) {
      await fetchReportsByMonth()
    }
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const pageClickHandler = async (page: number) => {
  filter.value.skip = page - 1
  await fetchReportsByMonth()
}

getCompanies()

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_FOND
  }
})
watch(
  () => filter.value.date,
  () => {
    tableData.value = []
  }
)
watch(
  () => filter.value.orgId,
  () => {
    tableData.value = []
    events.value = []
    filter.value.eventIdList = []
  }
)

watch(
  () => itemDate.value,
  () => {
    tableData.value = []
    events.value = []
    filter.value.eventIdList = []
    filter.value.orgId = ''
    filter.value.startDate = ''
    filter.value.endDate = ''
    filter.value.date = []
  }
)
watch(
  [filter],
  () => {
    if (itemDate.value == 'interval') {
      if (!filter.value.orgId) {
        return
      }
    } else {
      if (!filter.value.month || !filter.value.year || !filter.value.orgId) {
        return
      }
    }
    getEventList()
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.base-select__label {
  font-size: 14px;
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.base-date-input {
  &__label {
    font-size: 12px;
    display: block;
    min-height: 21px;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
}
</style>
