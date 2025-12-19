<template>
  <base-page-layout :title="t('tickets.returnedTickets')" :isLoading="loading">
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-select :label="t('tickets.organizers')" :placeholder="t('tickets.organizers')" color="indigo"
                :items="soldList" item-title="name" item-value="id" v-model="filter.eventOrgId"
                @update:model-value="eventData" clearable hide-details></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-select :label="t('tickets.event')" :placeholder="t('tickets.event')" color="indigo"
                :items="eventList" item-title="name" item-value="id" v-model="filter.eventId" clearable
                hide-details></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-input v-model="filter.fio" :placeholder="t('tickets.fullName')" :label="t('tickets.fullName')"
                color="indigo" clearable></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-input v-model="filter.ticketSerial" :placeholder="t('tickets.ticketSerialNumber')"
                :label="t('tickets.ticketSerialNumber')" color="indigo" clearable></base-input>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table :key="eventListKey" :tableHeader="tableHeader" :is-loading="loading" :pagination="{
        page: 0,
        total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
        pageClickHandler: pageClickHandler
      }" :tableBody="tableList"></base-table>
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { TableHeaderTypes } from '@/types/table.types'
import { CashDto, RejectedTicketsListForm } from '@/services/cash/dto/cash.dto'
import { getRejectedTicketsList, getSoldEventList, getSoldOrganizationList } from '@/services/cash/cash.service'
import { PERMISSIONS } from '@/constants/permissions'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import dayjs from 'dayjs'

definePage({
  meta: {
    permission: PERMISSIONS.CASH_RETURN_TICKETS
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
    role: 'text',
    key: 'eventBegin',
    id: '',
    render: (row: any) => {
      return row.payDate ? dayjs(row.payDate).format('HH:mm:ss  DD.MM.YYYY') : '-'
    }
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
    role: 'text',
    key: 'payDate',
    id: '',
    render: (row: any) => {
      return row.payDate ? dayjs(row.payDate).format('HH:mm:ss  DD.MM.YYYY') : '-'
    }
  },
  {
    text: t('sold_tickets.table.rejectionDate'),
    role: 'text',
    key: 'rejectDate',
    id: '',
    render: (row: any) => {
      return row.rejectDate ? dayjs(row.rejectDate).format('HH:mm:ss  DD.MM.YYYY') : '-'
    }
  },
  {
    text: t('sold_tickets.table.fiscal'),
    role: 'fiscal',
    key: 'qrCodeURL',
    id: ''
  }
])
const tableList = ref<CashDto[]>([])
const totalNumber = ref<number | undefined>(0)
const loading = ref(false)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number | null>(10)
const soldList = ref([])
const eventList = ref([])
const eventListKey = ref(0)

const filter = ref<RejectedTicketsListForm>({
  id: null,
  eventId: null,
  fio: null,
  ticketSerial: null,
  eventOrgId: null
})

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getRejectedTicketsList({
      skip: currentPage.value,
      take: itemsPerPage.value,
      ...filter.value
    })
    tableList.value = data?.result?.data ?? []
    totalNumber.value = data?.result?.total ?? 0
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
    } = await getSoldOrganizationList()
    soldList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const eventData = async () => {
  if (!filter.value.eventOrgId) return
  try {
    const {
      data: { result }
    } = await getSoldEventList(filter.value.eventOrgId)
    eventList.value = result
    console.log(eventList.value)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const pageClickHandler = async (page: number) => {
  currentPage.value = page - 1
  await fetchData()
}
watch(
  [filter],
  () => {
    if (!filter.value.eventOrgId) {
      filter.value.eventId = null
      eventList.value = []
    } else {
      eventListKey.value++
      currentPage.value = 0
      fetchData()
    }
  },
  { deep: true }
)

onMounted(async () => {
  await Promise.all([loadData(), fetchData()])
})
</script>
