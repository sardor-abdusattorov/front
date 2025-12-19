<template>
  <div class="theatre-tickets-actions">
    <div class="wrapper">
      <div>
        <div class="counter" v-if="cdStore.countdown.isVisible">{{ cdStore.countdown.time }}</div>
      </div>
      <div class="actions">
        <base-button v-if="store.isBooking" type="button" color="#FF9800" class="text-white" @click="addOrderBooking">
          {{ t('tickets.booking') }}
        </base-button>
        <v-checkbox
          v-if="userStore.user?.structureId === STRUCTURES.TOUR_AGENT"
          :model-value="hidePrice"
          class="checkbox"
          :label="t('is_hide_price')"
          color="primary"
          hide-details
          @change="showPrice = !hidePrice"
        ></v-checkbox>
        <v-checkbox
          v-model="shouldPrint"
          class="checkbox"
          :label="t('tickets.shouldPrint')"
          color="primary"
          hide-details
        ></v-checkbox>

        <base-select
          class="select"
          v-model="selectedPaymentType"
          :placeholder="t('sold_tickets.table.typePayment')"
          :items="paymentTypes"
          :item-title="`name${capitalize(locale)}`"
          item-value="id"
        />
      </div>
    </div>
    <div class="bottom">
      <div class="total" v-if="totalSum > 0">
        <span>{{ t('tickets.totalSum') }}:</span> {{ formatMoney(totalSum) }} UZS
      </div>
      <base-button
        size="large"
        type="button"
        color="primary"
        :disabled="store.theatreTickets.length === 0"
        @click="payHandler"
        >{{ t('cash.toPay') }}</base-button
      >
    </div>
    <div class="my-6" v-if="soldTickets.length > 0">
      <expansion-pannel
        v-for="list in soldTickets"
        :key="`${list.orderId}_${list.ticketList.length}`"
        :list="list"
        @get-tickets="getTickets"
        @fetch-data="fetchData"
        :clearList="clearList"
      />
    </div>
    <div style="position: absolute; z-index: -10" v-if="isTicketVisible">
      <vue-to-print :content="ticketComponentRef" remove-after-print>
        <template #trigger>
          <button ref="buttonToPrintRef"></button>
        </template>
      </vue-to-print>
      <div ref="ticketComponentRef">
        <museium-ticket v-if="isWithoutSeat" :showPrice="showPrice" />
        <theatre-ticket :showPrice="showPrice" v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VueToPrint } from 'vue-to-print'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'

import { capitalize, formatMoney, getErrorMessage } from '@/utils/functions'

import { useCountDown } from '@/stores/countdown.store'
import { useCashierStore } from '@/stores/cashier.store'

import { orderBooking, orderTicket, updateTickets } from '@/services/cash/cash.service'
import { getReportTicketPaymentType } from '@/services/report-ticket/report-ticket.service'
import { getTicketListPrinted, getTicketsByList } from '@/services/ticket/ticket.service'

import { TicketModel } from '@/services/ticket/model/ticker.model'
import { CashSoldDto } from '@/services/cash/dto'
import { PaymentTypeDto } from '@/services/region/dto/region.dto'
import { STRUCTURES } from '@/constants/structures'
import { useUserStore } from '@/stores/user.store'
import { getClearingBalance } from '@/services/payment/payment.service'
import { agentMinusBalance } from '@/services/organization/organization.service'

const store = useCashierStore()
const cdStore = useCountDown()
defineProps<{ isWithoutSeat: boolean }>()
const emit = defineEmits(['triggerLoadData'])

const { t, locale } = useI18n()

const paymentTypes = ref<PaymentTypeDto[]>([])
const shouldPrint = ref(true)
const selectedPaymentType = ref<any>(null)
const clearList = ref(false)
const isTicketVisible = ref(false)

const buttonToPrintRef = ref()
const ticketComponentRef = ref()
const userStore = useUserStore()
const soldTickets = ref<CashSoldDto[]>([])
const showPrice = ref(userStore.user?.structureId !== STRUCTURES.TOUR_AGENT)

const hidePrice = computed(() => {
  return !showPrice.value
})

const totalSum = computed(() => {
  return store.theatreTickets.reduce((acc, item) => acc + item.ticketSum, 0)
})

const fetchPaymentTypes = async () => {
  try {
    const { data } = await getReportTicketPaymentType()
    paymentTypes.value = data.result
    selectedPaymentType.value = paymentTypes.value[0].id
  } catch (error) {
    toast.error(getErrorMessage(error))
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

const payHandler = async () => {
  if (!selectedPaymentType.value) return toast.warning(t('cash.chooseAPaymentMethod'))

  if (userStore.user?.structureId === STRUCTURES.TOUR_AGENT) {
    if (totalSum.value > userStore.depozitBalance) return toast.warning(t('cash.notEnoughDepozit'))
  }

  try {
    store.loading = true
    const { data } = await updateTickets(store.theatreTickets)
    if (data.result.success) {
      const { data: soldTicketData } = await orderTicket({
        orderId: store.theatreTickets[0].orderId!,
        paymentTypeId: selectedPaymentType.value
      })

      soldTickets.value.push(soldTicketData.result)

      toast.success(t('tickets.ticktesSuccessPaid'))

      if (shouldPrint.value) {
        store.selectedTicketIds = store.theatreTickets.map((ticket) => ticket.orderTicketId)
        await printTicket()
      }

      if(userStore.user?.structureId === STRUCTURES.TOUR_AGENT) {
        try {
          await agentMinusBalance({ agentId: userStore.user?.organizationId as number, minusBalance: totalSum.value })
        } catch (error) {
          toast.error(getErrorMessage(error))
        }
        try {
          await fetchDepositeBalance()
        } catch (error) {
          toast.error(getErrorMessage(error))
        }
    }


      store.theatreTickets = []
      store.isBooking = false

      clearInterval(cdStore.countdownInterval)
      selectedPaymentType.value = null
      cdStore.countdown.isVisible = false
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    store.loading = false
  }
}

const fetchData = (id: number) => {
  soldTickets.value = soldTickets.value
    .map((item) => ({
      ...item,
      ticketList: item.ticketList.filter((ticket) => ticket.orderTicketId !== id)
    }))
    .filter((item) => item.ticketList.length > 0)
}

const printTicket = async () => {
  try {
    const { data } = await getTicketsByList(store.selectedTicketIds)
    getTickets(data.result)
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

const addOrderBooking = async () => {
  try {
    const { data } = await orderBooking(store.theatreTickets[0].orderId!)
    if (data.result.success) {
      toast.success(t('tickets.successBooked'))
      emit('triggerLoadData', true)
      cdStore.countdown.isVisible = false
      clearInterval(cdStore.countdownInterval)
      selectedPaymentType.value = null
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

onMounted(fetchPaymentTypes)

onUnmounted(() => {
  store.tickets = []
  store.theatreTickets = []
  store.selectedTicketIds = []
})
</script>

<style lang="scss" scoped>
.theatre-tickets-actions {
  margin: 24px 0;
  .wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    .counter {
      font-size: 16px;
      padding: 8px 16px;
      background-color: #f44336;
      border-radius: 6px;
      color: white;
      min-width: 120px;
      text-align: center;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .select {
      width: 250px;
    }
  }
  .bottom {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 24px;
  }
  .total {
    font-size: 18px;
    span {
      font-size: 16px;
      font-weight: 700;
    }
  }
}
</style>
<style lang="scss">
@import '@/styles/pages/cash';
</style>
