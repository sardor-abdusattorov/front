<template>
  <base-page-layout :title="t('report.reportsTicket.title')" :is-loading="loading">
    <template #actions>
      <base-button prepend-icon="mdi-microsoft-excel" @click="downloadExcel" v-if="ticket.length > 0">{{
        t('downExcel')
        }}</base-button>
    </template>
    <template #filter>
      <v-row class="align-start">
        <v-col cols="12" class="mt-4">
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title> {{ t('filter') }} </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-card-item>
                  <v-row>
                    <v-col cols="6" md="3">
                      <base-date-input multiple="range" v-model="date"
                        :placeholder="t('report.reportsTicket.saleStartDate')"
                        :label="t('report.reportsTicket.saleStartDate')"
                        @update="handleDateChange($event)"></base-date-input>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-input v-model="filter.orderNumber" :label="t('report.reportsTicket.orderNumber')"
                        :placeholder="t('report.reportsTicket.orderNumber')" type="number"></base-input>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-input v-model="filter.fiscalId" :label="t('fiscalId')" :placeholder="t('fiscalId')"
                        type="number"></base-input>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-input v-model="filter.ticketNumber" :label="t('report.reportsTicket.ticketSerialNumber')"
                        :placeholder="t('report.reportsTicket.ticketNumber')" type="number"></base-input>
                    </v-col>
                    <v-col cols="6" md="3" v-if="userStore.user?.structureId !== STRUCTURES.TOUR_AGENT">
                      <base-input v-model="filter.rowNumber" :label="t('report.reportsTicket.rowNumber')"
                        :placeholder="t('report.reportsTicket.rowNumber')" type="number"></base-input>
                    </v-col>
                    <v-col cols="6" md="3" v-if="userStore.user?.structureId !== STRUCTURES.TOUR_AGENT">
                      <base-input v-model="filter.placeNumber" :label="t('report.reportsTicket.placeNumber')"
                        :placeholder="t('report.reportsTicket.placeNumber')" type="number"></base-input>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-select item-value="id" item-title="name"
                        :label="t('report.reportsTicket.organizationTicketSale')"
                        :placeholder="t('report.reportsTicket.organizationTicketSale')" :items="saleOrgList"
                        v-model="filter.organizationTicketSale"></base-select>
                    </v-col>
                    <v-col cols="6" md="3" v-if="userStore.user?.structureId === STRUCTURES.FOND">
                      <base-select item-value="id" item-title="name" :label="t('event_organization')"
                        :placeholder="t('event_organization')" :items="ticketSellerList"
                        v-model="filter.eventOrg"></base-select>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-select :label="t('report.reportsTicket.event')"
                        :placeholder="t('report.reportsTicket.event')" item-value="id" item-title="name"
                        :items="eventList" v-model="filter.event"></base-select>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-select item-value="id" :item-title="'name' + capitalize(locale)"
                        :label="t('report.reportsTicket.paymentType')"
                        :placeholder="t('report.reportsTicket.paymentType')" :items="payTypeList"
                        v-model="filter.paymentType"></base-select>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-select :label="t('report.reportsTicket.cashier')"
                        :placeholder="t('report.reportsTicket.cashier')" item-value="id" item-title="name"
                        :items="cashierList" v-model="filter.cashier"></base-select>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-select :label="t('report.reportsTicket.returned')"
                        :placeholder="t('report.reportsTicket.returned')" item-title="text" item-value="value" :items="[
                          {
                            value: true,
                            text: t('yes')
                          },
                          {
                            value: false,
                            text: t('no')
                          }
                        ]" v-model="filter.returned"></base-select>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-select :label="t('report.reportsTicket.region')"
                        :placeholder="t('report.reportsTicket.region')" item-value="id"
                        :item-title="'name' + capitalize(locale)" :items="regionList"
                        v-model="filter.region"></base-select>
                    </v-col>
                    <v-col cols="6" md="3">
                      <base-select :label="t('report.reportsTicket.country')"
                        :placeholder="t('report.reportsTicket.country')" :item-title="'name' + capitalize(locale)"
                        item-value="id" :items="countryList" v-model="filter.country"></base-select>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </template>
    <template #content>
      <base-table :key="key" :tableHeader="tableHeader" :tableBody="ticket" :is-loading="loading" :pagination="{
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
import { useUserStore } from '@/stores/user.store'
import { ReportTicketOrderDto } from '@/services/report-ticket/dto/report-ticket-order.dto'
import {
  getExcelReportTicket,
  getReportTicketCashier,
  getReportTicketCountry,
  getReportTicketEvent,
  getReportTicketOrder,
  getReportTicketPaymentType,
  getReportTicketRegion,
  getReportTicketSaleOrg,
  getTicketEventOrgListForDropdown
} from '@/services/report-ticket/report-ticket.service'
import { PERMISSIONS } from '@/constants/permissions'
import { capitalize, downloadBlobAsFile, getErrorMessage, setCurrentDate, setDayBefore } from '@/utils/functions'
import dayjs from 'dayjs'
import { DATE_VIEW_FORMAT } from '@/constants/formats'
import { toast } from 'vue3-toastify'
import { PaymentTypeDto } from '@/services/region/dto/region.dto'
import { STRUCTURES } from '@/constants/structures'
const { t, locale } = useI18n()
const userStore = useUserStore()

const ticket = ref<ReportTicketOrderDto[]>([])
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const loading = ref(false)
const eventList = ref<string[]>([])
const saleOrgList = ref<string[]>([])
const ticketSellerList = ref<string[]>([])
const payTypeList = ref<PaymentTypeDto[]>([])
const regionList = ref<string[]>([])
const countryList = ref<string[]>([])
const cashierList = ref<string[]>([])
const key = ref(0)
definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_TICKETS
  }
})

const filter = ref({
  orderNumber: null,
  ticketNumber: '',
  rowNumber: null,
  placeNumber: null,
  saleStartDate: dayjs().startOf('day').toDate(),
  saleEndDate: dayjs().endOf('day').toDate(),
  organizationTicketSale: null,
  event: null,
  paymentType: null,
  returned: null,
  region: null,
  country: null,
  cashier: null,
  fiscalId: null,
  eventOrg: null

})

const date = ref([filter.value.saleStartDate, filter.value.saleEndDate])
const handleDateChange = (date: { from: Date; to: Date }) => {
  if (dayjs(date.from).isSame(date.to, 'day')) {
    filter.value.saleStartDate = date.from
    filter.value.saleEndDate = date.to
  }
  else {
    filter.value.saleStartDate = dayjs(date.from).startOf('day').toDate()
    filter.value.saleEndDate = dayjs(date.to).add(-1, 'day').endOf('day').toDate()
  }
}

const getSaleOrg = async () => {
  try {
    const {
      data: { result }
    } = await getReportTicketSaleOrg()
    saleOrgList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
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
    } = await getReportTicketEvent()
    eventList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getPaymentType = async () => {
  try {
    const {
      data: { result }
    } = await getReportTicketPaymentType()
    payTypeList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getRegion = async () => {
  try {
    const {
      data: { result }
    } = await getReportTicketRegion()
    regionList.value = result.data
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getCountry = async () => {
  try {
    const {
      data: { result }
    } = await getReportTicketCountry()
    countryList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const getCashier = async () => {
  try {
    const {
      data: { result }
    } = await getReportTicketCashier()
    cashierList.value = result
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
    } = await getReportTicketOrder({
      skip: currentPage.value,
      take: itemsPerPage.value,
      countryId: filter.value.country,
      regionId: filter.value.region,
      paymentTypeId: filter.value.paymentType,
      rowNumber: filter.value.rowNumber,
      seatNumber: filter.value.placeNumber,
      cashierId: filter.value.cashier,
      ticketSerial: filter.value.ticketNumber,
      startDate: dayjs(filter.value.saleStartDate).format(DATE_VIEW_FORMAT),
      endDate: dayjs(filter.value.saleEndDate).format(DATE_VIEW_FORMAT),
      isReject: filter.value.returned,
      eventId: filter.value.event,
      orderId: filter.value.orderNumber,
      orderOrgId: filter.value.organizationTicketSale,
      fiscalId: filter.value.fiscalId,
      eventOrgId: filter.value.eventOrg
    })
    ticket.value = data
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
    const { data } = await getExcelReportTicket({
      countryId: filter.value.country,
      regionId: filter.value.region,
      paymentTypeId: filter.value.paymentType,
      rowNumber: filter.value.rowNumber,
      seatNumber: filter.value.placeNumber,
      cashierId: filter.value.cashier,
      ticketSerial: filter.value.ticketNumber,
      startDate: dayjs(filter.value.saleStartDate).format(DATE_VIEW_FORMAT),
      endDate: dayjs(filter.value.saleEndDate).format(DATE_VIEW_FORMAT),
      isReject: filter.value.returned,
      eventId: filter.value.event,
      orderId: filter.value.orderNumber,
      orderOrgId: filter.value.organizationTicketSale,
      fiscalId: filter.value.fiscalId,
      eventOrgId: filter.value.eventOrg 
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
    text: t('report.reportsTicket.orderNumber'),
    role: 'text',
    key: 'orderId',
    id: ''
  },
  {
    text: t('fiscalId'),
    role: 'text',
    key: 'fiscalId',
    id: ''
  },
  {
    text: t('report.reportsTicket.ticketSerialNumber'),
    role: 'text',
    key: 'ticketSerial',
    id: ''
  },
  {
    text: t('report.reportsTicket.cashierName'),
    role: 'text',
    key: 'firstName',
    id: '',
    render: (row: ReportTicketOrderDto) => {
      return `${row.firstName} ${row.middleName} ${row.lastName}`
    }
  },
  {
    text: t('report.reportsTicket.region'),
    role: 'langText',
    key: 'region',
    id: ''
  },
  {
    text: t('report.reportsTicket.country'),
    role: 'langText',
    key: 'country',
    id: ''
  },
  {
    text: t('schema.sector'),
    role: 'text',
    key: 'sectorName',
    id: ''
  },
  {
    text: t('sold_tickets.table.seat'),
    role: 'text',
    key: 'seatNumber',
    id: '',
    render: (row: ReportTicketOrderDto) => {
      return row?.rowNumber ? `${row?.rowNumber}` + '/' + `${row?.seatNumber}` : ''
    }
  },
  {
    text: t('report.reportsTicket.provider'),
    role: 'text',
    key: 'orderOrgName',
    id: ''
  },
  {
    text: t('report.reportsTicket.establishment'),
    role: 'text',
    key: 'palaceOrgInn',
    id: ''
  },
  {
    text: t('report.returnedTicket.organization'),
    role: 'text',
    key: 'eventOrgName',
    id: ''
  },
  {
    text: t('report.reportsTicket.event'),
    role: 'text',
    key: 'eventName',
    id: ''
  },
  {
    text: t('report.reportsTicket.rate'),
    role: 'text',
    key: 'tarifName',
    id: ''
  },
  {
    text: t('report.reportsTicket.benefit'),
    role: 'text',
    key: 'privilegesName',
    id: ''
  },
  {
    text: t('report.reportsTicket.eventDate'),
    role: 'text',
    key: 'eventDate',
    id: ''
  },
  {
    text: t('report.reportsTicket.paymentType'),
    role: 'langText',
    key: 'paymentTypeName',
    id: ''
  },
  {
    text: t('report.reportsTicket.sum'),
    role: 'text',
    key: 'ticketSum',
    id: ''
  },

  {
    text: t('report.reportsTicket.dateSale'),
    role: 'text',
    key: 'payDate',
    id: ''
  },
  {
    text: t('report.reportsTicket.returned'),
    role: 'checkbox',
    key: 'isReject',
    id: ''
  },
  {
    text: t('report.reportsTicket.used'),
    role: 'text',
    key: 'ticketUsed',
    id: ''
  }
])
if (userStore.user?.structureId !== STRUCTURES.TOUR_AGENT) {
  tableHeader.value.push({
    text: t('report.reportsTicket.fund'),
    role: 'text',
    key: 'ticketFondSum',
    id: ''
  })
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
  await Promise.all([fetchData(), getTicketSeller(), getSaleOrg(), getEvent(), getPaymentType(), getRegion(), getCountry(), getCashier()])
})
</script>
