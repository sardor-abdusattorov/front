<template>
  <base-page-layout :title="t('report.returnedTicket.title')" :isLoading="loading">
    <template #actions>
      <base-button prepend-icon="mdi-microsoft-excel" @click="downloadExcel" v-if="ticketReturned.length > 0">{{
        t('downExcel')
      }}</base-button>
    </template>
    <template #filter>
      <v-card class="py-3">
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-input :placeholder="t('report.returnedTicket.orderNumber')"
                :label="t('report.returnedTicket.orderNumber')" v-model="filter.searchOrder" clearable></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-input :placeholder="t('report.returnedTicket.ticketNumber')"
                :label="t('report.returnedTicket.ticketNumber')" v-model="filter.search" clearable></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-date-input v-model="dateValue" @update="updateDate($event)" multiple="range" :label="t('date')"
                :placeholder="t('date')"></base-date-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select :label="t('report.returnedTicket.event')" :placeholder="t('report.returnedTicket.event')"
                item-title="name" item-value="id" :items="eventList" v-model="filter.event"></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-select :label="t('report.returnedTicket.organizationTicketSale')"
                :placeholder="t('report.returnedTicket.organizationTicketSale')" item-title="name" item-value="id"
                :items="organizationList" v-model="filter.organization"></base-select>
            </v-col>
            <v-col cols="12" md="3" v-if="userStore.user?.structureId === STRUCTURES.FOND">
              <base-select item-value="id" item-title="name" :label="t('event_organization')"
                :placeholder="t('event_organization')" :items="ticketSellerList"
                v-model="filter.eventOrg"></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table :key="key" :tableHeader="tableHeader" :tableBody="ticketReturned" :is-loading="loading" :pagination="{
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
import {
  getExcelReportReturnedTicket,
  getReportTicketReturned,
  getReportTicketReturnedEvent,
  getReportTicketReturnedSaleOrg
} from '@/services/report-returned/report-ticket-returned'
import { getTicketEventOrgListForDropdown } from '@/services/report-ticket/report-ticket.service'
import { ReportTicketReturnedDto } from '@/services/report-returned/dto/report-ticket-returned.dto'
import { PERMISSIONS } from '@/constants/permissions'
import dayjs from 'dayjs'
import { DATE_VIEW_FORMAT } from '@/constants/formats'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'

import { downloadBlobAsFile, getErrorMessage } from '@/utils/functions'
import { toast } from 'vue3-toastify'
const { t } = useI18n()
const userStore = useUserStore()

const ticketReturned = ref<ReportTicketReturnedDto[]>([])
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const loading = ref(false)
const eventList = ref<object[]>([])
const organizationList = ref<object[]>([])
const ticketSellerList = ref<string[]>([])
const key = ref(0)
definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_TICKETS
  }
})

const filter = ref({
  searchOrder: null,
  search: '',
  from: dayjs().add(-31, 'day').toDate(),
  to: dayjs().add(0, 'day').toDate(),
  event: null,
  organization: null,
  eventOrg: null
})

const dateValue = ref([filter.value.from, filter.value.to])

const updateDate = (data: { from: Date; to: Date }) => {
  filter.value.from = data.from
  filter.value.to = data.to
}

const getTicketSeller = async () => {
  try {
    const {
      data: { result }
    } = await getTicketEventOrgListForDropdown()
    ticketSellerList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getEvent = async () => {
  try {
    const {
      data: { result }
    } = await getReportTicketReturnedEvent()
    eventList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const getOrganization = async () => {
  try {
    const {
      data: { result }
    } = await getReportTicketReturnedSaleOrg()
    organizationList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getReportTicketReturned({
      skip: currentPage.value,
      take: itemsPerPage.value,
      ticketSerial: filter.value.search,
      orderId: filter.value.searchOrder,
      eventId: filter.value.event,
      startDate: dayjs(filter.value.from).format(DATE_VIEW_FORMAT),
      endDate: dayjs(filter.value.to).format(DATE_VIEW_FORMAT),
      orderOrgId: filter.value.organization,
      eventOrgId: filter.value.eventOrg
    })
    ticketReturned.value = data
    totalNumber.value = total
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const downloadExcel = async () => {
  loading.value = true
  try {
    const { data } = await getExcelReportReturnedTicket({
      ticketSerial: filter.value.search,
      orderId: filter.value.searchOrder,
      eventId: filter.value.event,
      startDate: dayjs(filter.value.from).format(DATE_VIEW_FORMAT),
      endDate: dayjs(filter.value.to).format(DATE_VIEW_FORMAT),
      orderOrgId: filter.value.organization
    })

    downloadBlobAsFile(data, 'Report-Ticket.xlsx')
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('report.returnedTicket.orderNumber'),
    role: 'text',
    key: 'orderId',
    id: ''
  },
  {
    text: t('report.returnedTicket.ticketNumber'),
    role: 'text',
    key: 'ticketSerial',
    id: ''
  },
  {
    text: t('report.returnedTicket.event'),
    role: 'text',
    key: 'eventName',
    id: ''
  },
  {
    text: t('report.returnedTicket.organization'),
    role: 'text',
    key: 'eventOrgName',
    id: ''
  },
  {
    text: t('report.statisticsTicket.sector'),
    role: 'text',
    key: 'sectorName',
    id: ''
  },
  {
    text: t('sold_tickets.table.seat'),
    role: 'text',
    key: 'seatNumber',
    id: '',
    render: (row: any) => {
      return row?.rowNumber ? `${row?.rowNumber}` + '/' + `${row?.seatNumber}` : ''
    }
  },
  {
    text: t('report.returnedTicket.sum'),
    role: 'text',
    key: 'ticketSum',
    id: ''
  },
  {
    text: t('report.returnedTicket.refundedAmount'),
    role: 'text',
    key: 'rejectSum',
    id: ''
  },
  {
    text: t('report.returnedTicket.penaltyAmount'),
    role: 'text',
    key: 'fineSum',
    id: ''
  },
  {
    text: t('report.returnedTicket.returnDate'),
    role: 'text',
    key: '_rejectDate',
    id: ''
  },
  {
    text: t('report.returnedTicket.dateSale'),
    role: 'text',
    key: '_payDate',
    id: ''
  }
])

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
  await Promise.all([fetchData(), getEvent(), getOrganization(), getTicketSeller()])
})
</script>
