<template>
  <div>
    <base-title :title="t('tickets.soldTickets')">
      <template #actions>
        <base-button v-if="userStore.user?.structureId === STRUCTURES.MUZEY" prepend-icon="mdi-microsoft-excel"
          @click="downloadExcel">{{
            t('tickets.printTheDailyReport')
          }}</base-button>
      </template>
    </base-title>

    <v-card class="mb-4">
      <v-card-item>
        <v-row>
          <v-col cols="12" md="3" sm="6">
            <base-date-input multiple="range" v-model="date" :placeholder="t('tickets.selectDate')"
              :label="t('tickets.selectDate')" @update="handleDateChange($event)"></base-date-input>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <base-select :label="t('user.organizer')" color="indigo" :items="soldList" v-model="filter.id"
              @update:model-value="eventData" item-title="name" item-value="id" :placeholder="t('user.organizer')"
              clearable hide-details></base-select>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <base-select :label="t('tickets.event')" color="indigo" :items="eventList" item-title="name" item-value="id"
              v-model="filter.eventId" :placeholder="t('tickets.event')" clearable hide-details></base-select>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <base-input v-model="filter.fio" :placeholder="t('tickets.fullName')" :label="t('tickets.fullName')"
              color="indigo" clearable></base-input>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <base-input v-model="filter.ticketSerial" :placeholder="t('tickets.ticketSerialNumber')"
              :label="t('tickets.ticketSerialNumber')" color="indigo" clearable></base-input>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <base-input v-model="filter.orderId" :placeholder="t('tickets.orderNumber')"
              :label="t('tickets.orderNumber')"></base-input>
          </v-col>
          <v-col cols="12" md="6" sm="6" class="d-flex justify-end align-end">
            <base-button prepend-icon="mdi-printer" @click="printTicket">
              {{ t('tickets.printOptional') }}
            </base-button>
          </v-col>
        </v-row>
      </v-card-item>
    </v-card>
    <v-card v-if="Array.isArray(dataList) && dataList.length > 0">
      <v-card-item>
        <expansion-pannel v-for="list in dataList" :key="`${list.orderId}_${list.ticketList.length}`" :list="list"
          @get-tickets="getTickets" @fetchData="() => {
            dataList = []
            fetchData()
          }
            " :clearList="clearList" />
      </v-card-item>
    </v-card>
    <v-pagination v-if="pagination.total" :key="dataListKey" class="mt-4 base-pagination" rounded="circle"
      density="comfortable" active-color="#8e24aa" total-visible="5" :value:model-value="pagination.page"
      :length="Math.ceil(pagination.total / pagination.perPage)"
      @update:model-value="pageClickHandler($event)"></v-pagination>
    <base-spinner v-if="loading" />
    <base-empty v-if="!loading && dataList.length === 0" />
  </div>
  <div style="position: absolute; z-index: -10" v-if="isTicketVisible">
    <vue-to-print :content="ticketComponentRef" remove-after-print>
      <template #trigger>
        <button ref="buttonToPrintRef"></button>
      </template>
    </vue-to-print>
    <div ref="ticketComponentRef">
      <theatre-ticket v-if="userStore.isTheatre" />
      <museium-ticket v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueToPrint } from 'vue-to-print'
import { useI18n } from 'vue-i18n'

import {
  getPdfDailyReport,
  getSoldEventList,
  getSoldOrganizationList,
  getSoldTicketList
} from '@/services/cash/cash.service'
import { CashSoldDto, SoldOrganizationListForm } from '@/services/cash/dto/cash.dto'

import { PERMISSIONS } from '@/constants/permissions'

import { scrollTop, getErrorMessage, printBlobContent } from '@/utils/functions'
import { toast } from 'vue3-toastify'
import { TicketModel } from '@/services/ticket/model/ticker.model'
import { useCashierStore } from '@/stores/cashier.store'
import { getClearingBalance } from '@/services/payment/payment.service'
import { getTicketListPrinted, getTicketsByList } from '@/services/ticket/ticket.service'
import { useUserStore } from '@/stores/user.store'
import dayjs from 'dayjs'
import { STRUCTURES } from '@/constants/structures'

definePage({ meta: { permission: PERMISSIONS.CASH_MONITORING } })

const { t } = useI18n()
const soldList = ref([])
const eventList = ref([])
const store = useCashierStore()
const userStore = useUserStore()

const isTicketVisible = ref(false)
const ticketComponentRef = ref()
const buttonToPrintRef = ref()

const loading = ref<boolean>(false)
const dataList = ref<CashSoldDto[]>([])
const clearList = ref(false)
//const tableKey = ref(0)

const filter = ref<SoldOrganizationListForm>({
  id: null,
  eventId: null,
  fio: null,
  ticketSerial: null,
  orderId: null,
  fromDate: null,
  toDate: null,
  eventOrgId: null
})
const dataListKey = ref(0)
const date = ref()

const pagination = ref({
  page: 0,
  total: 0,
  perPage: 10
})

const downloadExcel = async () => {
  loading.value = true
  try {
    const { data } = await getPdfDailyReport({
      from: filter.value.fromDate ? dayjs(filter.value.fromDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss') : dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: filter.value.toDate ? dayjs(filter.value.toDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss') : dayjs().endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      isAll: true,
      palaceId: null
    })

    printBlobContent(data)
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const fetchDepositeBalance = async () => {
  try {
    const { data } = await getClearingBalance()
    userStore.depozitBalance = data.result.balance
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}


const fetchData = async () => {
  loading.value = true

  try {
    const { data } = await getSoldTicketList({
      skip: pagination.value.page,
      take: pagination.value.perPage,
      ...filter.value,
      fromDate: filter.value.fromDate ? dayjs(filter.value.fromDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss') : null,
      toDate: filter.value.toDate ? dayjs(filter.value.toDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss') : null
    })
    dataList.value = data.result?.data ?? []
    pagination.value.total = data.result?.total ?? 0

    await fetchDepositeBalance()
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
  const id = filter.value.id
  try {
    const {
      data: { result }
    } = await getSoldEventList(id)
    eventList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const printTicket = async () => {
  try {
    if (store.selectedTicketIds.length === 0) return toast.warning(t('sold_tickets.select_ticket'))
    const { data } = await getTicketsByList(store.selectedTicketIds)
    await getTickets(data.result)
    await getTicketListPrinted(store.selectedTicketIds)
    store.selectedTicketIds = []
    clearList.value = true
    setTimeout(() => {
      clearList.value = false
    }, 2000)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const getTickets = async (tickets: TicketModel[]) => {
  isTicketVisible.value = true
  store.tickets = tickets
  setTimeout(() => {
    buttonToPrintRef.value.click()
  }, 100)
  setTimeout(() => {
    isTicketVisible.value = false
    store.clearValues()
  }, 3000)
}

watch(
  () => filter,
  () => {
    dataListKey.value++
    pagination.value.page = 0
    fetchData()
  },
  { deep: true, immediate: true }
)

const pageClickHandler = async (page: number) => {
  pagination.value.page = page - 1
  await fetchData()
  scrollTop()
}

const handleDateChange = (data: { from: Date; to: Date }) => {
  console.log('data', data)
  if (dayjs(data.from).isSame(data.to, 'day')) {
    filter.value.fromDate = data.from
    filter.value.toDate = data.to
  }
  else {
    filter.value.fromDate = dayjs(data.from).startOf('day').toDate()
    filter.value.toDate = dayjs(data.to).add(-1, 'day').endOf('day').toDate()
  }
}
loadData()
</script>

<style lang="scss">
@import '@/styles/pages/cash';
</style>
