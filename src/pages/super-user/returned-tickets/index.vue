<template>
  <base-page-layout :title="t('tickets.returnedTickets')" :isLoading="loading">
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-select
                :label="t('tickets.organizers')"
                :placeholder="t('tickets.organizers')"
                color="indigo"
                :items="soldList"
                item-title="text"
                item-value="value"
                v-model="filter.orgId"
                @update:model-value="eventData"
                clearable
                hide-details
              ></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-select
                :label="t('tickets.event')"
                :placeholder="t('tickets.event')"
                color="indigo"
                :items="eventList"
                item-title="text"
                item-value="value"
                v-model="filter.eventId"
                clearable
                hide-details
                @update:model-value="seansData"
              ></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-select
                :items="seans"
                item-value="id"
                item-title="name"
                v-model="filter.sessionId"
                :placeholder="t('report.statisticsTicket.session')"
                :label="t('report.statisticsTicket.session')"
                @update:model-value="fetchData"
              />
            </v-col>
            <v-col cols="12" md="3">
              <base-input
                v-model="filter.orderSerial"
                :placeholder="t('tickets.ticketSerialNumber')"
                :label="t('tickets.ticketSerialNumber')"
                color="indigo"
                @update:model-value="serialNumberSearch"
                clearable
              ></base-input>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table
        :tableHeader="tableHeader"
        :is-loading="loading"
        :pagination="{
          page: 0,
          total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
          pageClickHandler: pageClickHandler
        }"
        :tableBody="tableList"
        :menuList="menuList"
      ></base-table>
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { CashDto } from '@/services/cash/dto/cash.dto'
import { PERMISSIONS } from '@/constants/permissions'
import { debounce } from '@/utils/functions'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { getCompanyAllList } from '@/services/organization/organization.service'
import { getAllEventByOrganizationId } from '@/services/events/events.service'
import { getSessionsByEvent } from '@/services/tarif/tarif.service'
import { getRejectTicketListForSU } from '@/services/super-user/super-user.service'

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS
  }
})

const { t } = useI18n()
const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('sold_tickets.table.ticketSerialNumber'),
    role: 'text',
    key: 'ticketSerial',
    id: ''
  },
  {
    text: t('sold_tickets.table.palace'),
    role: 'text',
    key: 'palaceName',
    id: ''
  },
  {
    text: t('sold_tickets.table.event'),
    role: 'text',
    key: 'eventName',
    id: ''
  },
  {
    text: t('sold_tickets.table.price'),
    role: 'sum',
    key: 'ticketSum',
    id: ''
  },
  {
    text: t('tickets.refundOfTheAmount'),
    role: 'sum',
    key: 'rejectSum',
    id: ''
  },
  {
    text: t('sold_tickets.table.fineAmount'),
    role: 'sum',
    key: 'fineSum',
    id: ''
  },
  {
    text: t('sold_tickets.table.eventStartDate'),
    role: 'date',
    key: 'eventBegin',
    id: ''
  },
  {
    text: t('sold_tickets.table.fio'),
    role: 'text',
    key: 'fio',
    id: ''
  },
  {
    text: t('sold_tickets.table.phone'),
    role: 'phone',
    key: 'phone',
    id: ''
  },
  {
    text: t('sold_tickets.table.pinfl'),
    role: 'text',
    key: 'pnfl',
    id: ''
  },
  {
    text: t('sold_tickets.table.datePayment'),
    role: 'date',
    key: 'payDate',
    id: ''
  },
  {
    text: t('sold_tickets.table.rejectionDate'),
    role: 'date',
    key: 'rejectDate',
    id: ''
  },
  {
    text: t('sold_tickets.table.fiscal'),
    role: 'text',
    key: 'aa',
    id: ''
  }
])
const tableList = ref<CashDto[]>([])
const totalNumber = ref<number | undefined>(0)
const loading = ref(false)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number | null>(10)
const soldList = ref<any>()
const eventList = ref<any>([])
const seans = ref<any>([])
const filter = ref<any>({
  eventId: null,
  sessionId: null,
  orderSerial: null,
  orgId: null
})
const menuList = ref<TableActionListType[]>([
  { id: 1, name: t('tariffs.menu.edit') },
  { id: 2, name: t('tariffs.menu.delete') }
])

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { data, total }
      }
    } = await getRejectTicketListForSU({
      skip: currentPage.value,
      take: itemsPerPage.value,
      ...filter.value
    })
    tableList.value = data
    totalNumber.value = total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}
const loadData = async () => {
  try {
    const {
      data: { result }
    } = await getCompanyAllList()
    soldList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const eventData = async () => {
  if (!filter.value.orgId) return
  try {
    const {
      data: { result }
    } = await getAllEventByOrganizationId(filter.value.orgId)
    eventList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const seansData = async () => {
  if (!filter.value.eventId) return
  try {
    const {
      data: { result }
    } = await getSessionsByEvent(filter.value.eventId)
    seans.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const serialNumberSearch = debounce(async () => {
  if (filter.value.orgId && filter.value.sessionId && filter.value.eventId) {
    await fetchData()
  }
}, 300)

const pageClickHandler = async (page: number) => {
  currentPage.value = page - 1
  await fetchData()
}

watch(
  () => filter.value.orgId,
  () => {
    eventList.value = []
    filter.value.eventId = null
  }
)

watch(
  () => filter.value.eventId,
  () => {
    seans.value = []
    tableList.value = []
    filter.value.sessionId = null
    filter.value.orderSerial = null
  }
)

onMounted(async () => {
  await Promise.all([loadData()])
})
</script>
