<template>
  <div>
    <base-title :title="t('tickets.bookedTickets')" />

    <v-card class="mb-4">
      <v-card-item>
        <v-row>
          <v-col cols="12" md="3" sm="6">
            <base-select
              :label="t('user.organizer')"
              color="indigo"
              :items="soldList"
              v-model="filter.id"
              @update:model-value="eventData"
              item-title="name"
              item-value="id"
              :placeholder="t('user.organizer')"
              clearable
              hide-details
            ></base-select>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <base-select
              :label="t('tickets.event')"
              color="indigo"
              :items="eventList"
              item-title="name"
              item-value="id"
              v-model="filter.eventId"
              :placeholder="t('tickets.event')"
              clearable
              hide-details
            ></base-select>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <base-input
              v-model="filter.fio"
              :placeholder="t('tickets.fullName')"
              :label="t('tickets.fullName')"
              color="indigo"
              clearable
            ></base-input>
          </v-col>
          <v-col cols="12" md="3" sm="6">
            <base-input
              v-model="filter.ticketSerial"
              :placeholder="t('tickets.ticketSerialNumber')"
              :label="t('tickets.ticketSerialNumber')"
              color="indigo"
              clearable
            ></base-input>
          </v-col>
        </v-row>
      </v-card-item>
    </v-card>
    <v-card v-if="Array.isArray(dataList) && dataList.length > 0">
      <v-card-item>
        <expansion-pannel
          v-for="list in dataList"
          :key="`${list.orderId}_${list.ticketList.length}`"
          :list="list"
          @fetchData="fetchData"
          @payForTickets="payForTickets"
          @payOrder="payOrder"
          @deleteTicket="deleteTicket"
          :clearList="clearList"
          :is-booking="true"
        />
      </v-card-item>
    </v-card>
    <v-pagination
      :key="dataListKey"
      v-if="pagination.total"
      class="mt-4 base-pagination"
      rounded="circle"
      density="comfortable"
      active-color="#8e24aa"
      total-visible="5"
      :value:model-value="pagination.page"
      :length="Math.ceil(pagination.total / pagination.perPage)"
      @update:model-value="pageClickHandler($event)"
    ></v-pagination>
    <base-spinner v-if="loading" />
    <base-empty v-if="!loading && !dataList.length" />

    <v-dialog v-model="dialog" width="600">
      <v-card :title="t('cash.chooseAPaymentMethod')" class="card">
        <template v-slot:text>
          <template v-if="!isDialogLoading">
            <div class="wrapper">
              <base-button
                :color="selectedPaymentTypeId === item.id ? 'primary' : ''"
                :style="{
                  color: selectedPaymentTypeId === item.id ? 'white' : 'black !important',
                  transition: 'all 0.3s'
                }"
                v-for="item in paymentTypes"
                :key="item.id"
                @click="selectedPaymentTypeId = item.id"
                >{{ item.name }}</base-button
              >
            </div>
            <v-divider class="my-4"></v-divider>
            <div class="d-flex justify-end ga-2">
              <v-btn
                :text="t('actions.close')"
                @click="
                  () => {
                    dialog = false
                    selectedPaymentTypeId = null
                  }
                "
              ></v-btn>
              <base-button @click="payBookingTickets"> {{ t('cash.toPay') }}</base-button>
            </div>
          </template>
          <v-progress-circular v-else class="spinner" color="#7e57c2" indeterminate></v-progress-circular>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import {
  getBookingTicketList,
  getSoldEventList,
  getSoldOrganizationList,
  orderBookingPayment,
  removeTicket
} from '@/services/cash/cash.service'
import { BookedTicketsListForm, CashSoldDto } from '@/services/cash/dto/cash.dto'

import { PERMISSIONS } from '@/constants/permissions'

import { scrollTop, getErrorMessage } from '@/utils/functions'
import { toast } from 'vue3-toastify'
import { useCashierStore } from '@/stores/cashier.store'
import { getReportTicketPaymentType } from '@/services/report-ticket/report-ticket.service'
import { PaymentTypeDto } from '@/services/region/dto/region.dto'

definePage({ meta: { permission: PERMISSIONS.CASH_MONITORING } })

const { t } = useI18n()
const store = useCashierStore()
const dialog = ref(false)
const isDialogLoading = ref(false)

const soldList = ref([])
const eventList = ref([])
const paymentTypes = ref<PaymentTypeDto[]>([])
const dataListKey = ref(0)

const loading = ref<boolean>(false)
const dataList = ref<CashSoldDto[]>([])
const clearList = ref(false)

const filter = ref<BookedTicketsListForm>({
  id: undefined,
  eventId: undefined,
  fio: undefined,
  ticketSerial: undefined
})

const selectedPaymentTypeId = ref<number | null>(null)

const pagination = ref({
  page: 0,
  total: 0,
  perPage: 10
})

const selectedList = ref<CashSoldDto | null>(null)

const fetchData = async () => {
  loading.value = true

  try {
    const { data } = await getBookingTicketList({
      ...filter.value,
      skip: pagination.value.page,
      take: pagination.value.perPage
    })
    dataList.value = data?.result?.data ?? []
    pagination.value.total = data?.result?.total ?? 0
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const fetchPaymentTypes = async () => {
  try {
    const { data } = await getReportTicketPaymentType()
    paymentTypes.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const loadData = async () => {
  try {
    const { data } = await getSoldOrganizationList()
    soldList.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const eventData = async () => {
  try {
    const { data } = await getSoldEventList(filter.value.id!)
    eventList.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const clearValues = () => {
  filter.value = {
    id: undefined,
    eventId: undefined,
    fio: undefined,
    ticketSerial: undefined
  }

  store.selectedTicketIds = []
  selectedPaymentTypeId.value = null

  selectedList.value = null

  fetchData()
}

const payBookingTickets = async () => {
  if (!selectedPaymentTypeId.value) return toast.error(t('cash.chooseAPaymentMethod'))
  try {
    isDialogLoading.value = true

    await orderBookingPayment({
      paymentTypeId: selectedPaymentTypeId.value!,
      orderTicketIdList:
        store.selectedTicketIds.length > 0
          ? store.selectedTicketIds
          : selectedList.value?.ticketList.map((item) => item.orderTicketId) || []
    })
    toast.success(t('cash.pay_for_tickets_success'))

    clearValues()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isDialogLoading.value = false
    dialog.value = false
  }
}

const payForTickets = async (list: CashSoldDto) => {
  selectedList.value = list
  dialog.value = true
}

const payOrder = (id: number) => {
  store.selectedTicketIds = [id]
  dialog.value = true
}

const deleteTicket = async (id: number) => {
  try {
    const { data } = await removeTicket(id)
    if (data.result.success) {
      toast.success(t('messages.deleted_success'))
      fetchData()
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

watch(
  [filter],
  () => {
    dataListKey.value++
    pagination.value.page = 0
    fetchData()
  },
  { deep: true }
)

const pageClickHandler = async (page: number) => {
  pagination.value.page = page - 1
  await fetchData()
  scrollTop()
}

onMounted(async () => {
  await Promise.all([fetchData(), loadData(), fetchPaymentTypes()])
})
</script>

<style lang="scss">
@import '@/styles/pages/cash';
</style>

<style lang="scss" scoped>
.wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.card {
  min-height: 250px;
  position: relative;
}
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
