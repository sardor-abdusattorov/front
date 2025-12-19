<template>
  <base-page-layout :title="t('report.statisticsTicket.title')" :isLoading="loading">
    <template #filter>
      <v-card class="py-3">
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-input v-model="filter.search" :label="t('report.statisticsTicket.idTicket')"
                :placeholder="t('search')" clearable></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select :label="t('report.statisticsTicket.event')" :items="eventCreatorList"
                :placeholder="t('report.statisticsTicket.event')" v-model="filter.event"></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-select :label="t('report.statisticsTicket.status')" :items="ticketStatusList"
                :item-title="`name${capitalize(locale)}`" :placeholder="t('report.statisticsTicket.status')"
                v-model="filter.status"></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-select :label="t('report.statisticsTicket.reason')" :items="ticketReasonList"
                :item-title="`name${capitalize(locale)}`" :placeholder="t('report.statisticsTicket.reason')"
                v-model="filter.reason"></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table :key="key" :tableHeader="tableHeader" :tableBody="reportTicket" :is-loading="loading" :pagination="{
        page: currentPage,
        total: Math.ceil(totalNumber ? totalNumber / itemsPerPage : 0),
        pageClickHandler: (page: number) => {
          currentPage = page - 1
          fetchData()
        }
      }"></base-table>
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import type { TableHeaderTypes } from '@/types/table.types'
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import {
  getReportEventListCreator,
  getReportRejectReason,
  getReportTicketStatus,
  getReportValidationTable
} from '@/services/report-validation/report-validation.service'
import { ReportValidationDto } from '@/services/report-validation/dto/report-validation.dto'
import { PERMISSIONS } from '@/constants/permissions'
import { toast } from 'vue3-toastify'
import { getErrorMessage, capitalize } from '@/utils/functions'
import dayjs from 'dayjs'
const { t, locale } = useI18n()

const reportTicket = ref<ReportValidationDto[]>([])
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const loading = ref(false)
const eventCreatorList = ref<object[]>([])
const ticketStatusList = ref<object[]>([])
const ticketReasonList = ref<object[]>([])
const key = ref(0)
definePage({
  meta: {
    permission: PERMISSIONS.CHRONOLGY_VALIDATION
  }
})

const filter = ref({
  search: '',
  event: null,
  status: null,
  reason: null
})

const eventListCreator = async () => {
  try {
    const {
      data: { result }
    } = await getReportEventListCreator()
    eventCreatorList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const reportTicketStatus = async () => {
  try {
    const {
      data: { result }
    } = await getReportTicketStatus()
    ticketStatusList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const reportTicketReasonList = async () => {
  try {
    const {
      data: { result }
    } = await getReportRejectReason()
    ticketReasonList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getReportValidationTable({
      skip: currentPage.value,
      take: itemsPerPage.value,
      ticketNumber: filter.value.search,
      eventId: filter.value.event,
      statusId: filter.value.status,
      rejectId: filter.value.reason
    })
    reportTicket.value = data
    totalNumber.value = total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

watch(
  [filter],
  () => {
    key.value++
    currentPage.value = 0
    fetchData()
  },
  { deep: true }
)
onMounted(async () => {
  await Promise.all([fetchData(), eventListCreator(), reportTicketStatus(), reportTicketReasonList()])
})

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('report.statisticsTicket.idTicket'),
    role: 'text',
    key: 'ticketNumber',
    id: ''
  },
  {
    text: t('report.statisticsTicket.event'),
    role: 'text',
    key: 'eventName',
    id: ''
  },
  {
    text: t('report.statisticsTicket.session'),
    role: 'text',
    key: 'sessionName',
    id: ''
  },
  {
    text: t('report.statisticsTicket.status'),
    role: 'text',
    key: 'statusName',
    id: '',
    render: (row: any) => {
      let rows = row.statusName.split('/')
      let matchingRows = rows.filter((item: any) => item.startsWith(locale.value.toUpperCase()));
      return matchingRows[0] ? matchingRows[0].split(':')[1] : '-'
    }

  },
  {
    text: t('report.statisticsTicket.reason'),
    role: 'text',
    key: 'rejectReasonName',
    id: ''
  },
  {
    text: t('report.statisticsTicket.sector'),
    role: 'text',
    key: 'sectorName',
    id: ''
  },
  {
    text: t('report.statisticsTicket.row'),
    role: 'text',
    key: 'rowNumber',
    id: ''
  },
  {
    text: t('report.statisticsTicket.validationDate'),
    role: 'text',
    key: 'validationDate',
    id: '',
    render: (row: any) => {
      return row.validationDate ? dayjs(row.validationDate).format('HH:mm:ss  DD.MM.YYYY') : '-'
    }
  }
])
</script>
