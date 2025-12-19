<template>
  <base-title :title="t('cash.boxOffice')" />
  <v-card class="py-4 px-6">
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <base-select :items="organizations" item-value="orgId" item-title="orgName" v-model="filter.organizatorId"
          :placeholder="userStore.user?.structureId === STRUCTURES.TOUR_AGENT ? t('museum') : t('user.organizer')"
          @update:model-value="() => {
            filter.organizatorId && fetchEventList(filter.organizatorId)
            filter.eventId = null
          }
            " />
      </v-col>
      <v-col cols="12" md="3">
        <base-select :items="events" item-value="eventId" item-title="eventName" v-model="filter.eventId"
          :placeholder="t('cash.event')" @update:model-value="() => {
            filter.eventId && fetchSessionList(filter.eventId)
            filter.sessionId = null
            const selectedEvent = events.find((e) => e.eventId === filter.eventId)
            event.palaceHallName = selectedEvent?.palaceHallName!
            event.palaceName = selectedEvent?.palaceName!
            event.eventName = selectedEvent?.eventName!

            isWithoutSeat = selectedEvent?.isWithoutSeats!
          }
            " />
      </v-col>
      <v-col cols="12" md="3">
        <base-select :items="seans" item-value="id" item-title="name" v-model="filter.sessionId"
          :placeholder="t('report.statisticsTicket.session')" @update:model-value="() => {
            const selectedSeans = seans.find((s) => s.id === filter.sessionId)
            event.eventBegin = selectedSeans?.eventBegin as string
            fetchTarifList()
          }
            " />
      </v-col>
      <v-col cols="12" md="3" v-if="filter.sessionId && !isWithoutSeat">
        <v-btn @click="updateMap" density="comfortable" color="#ff9800" class="text-white" icon="mdi-refresh"></v-btn>
      </v-col>
      <template v-if="filter.sessionId && isWithoutSeat">
        <v-col cols="12" md="3">
          <base-select :items="sessionTarifList" item-value="id" v-model="tarifId" item-title="name"
            :placeholder="t('cash.rate')" />
        </v-col>
        <v-col cols="12" md="3">
          <v-number-input v-model="ticketCount" :min="0" :max="100" :label="t('ticketCount')" color="indigo"
            density="compact"></v-number-input>
        </v-col>
        <v-col cols="12" md="3">
          <base-button :disabled="!ticketCount || !tarifId" @click="fetchOrderTicketList">{{ t('buy') }}</base-button>
        </v-col>
      </template>
    </v-row>

    <theatre-hall-map v-if="isRender && !isWithoutSeat && filter.sessionId" :sessionId="filter.sessionId" :event="event"
      :sessionTarifList="sessionTarifList" />
    <theatre-tickets-table />
    <theatre-tickets-actions @triggerLoadData="fetchOrderTicketList" :isWithoutSeat="isWithoutSeat" />
    <base-spinner v-if="store.loading" />
  </v-card>
</template>

<script lang="ts" setup>
import { useCountDown } from '@/stores/countdown.store'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'

import { PERMISSIONS } from '@/constants/permissions'
import {
  addTicketWithoutSeat,
  getCashierList,
  getMuseumList,
  getOrderTicketList,
  getOrganizationList,
  getSessionTariffList,
  getTariffList
} from '@/services/cash/cash.service'
import { CashEventModel, CashierFilter, SessionModel, TarifsModel } from '@/services/cash/model'
import { OrganizationList } from '@/services/cash/model/organization'
import { useCashierStore } from '@/stores/cashier.store'
import { getErrorMessage, sleep } from '@/utils/functions'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'
import { GetEventListForTourAgent } from '@/services/payment/payment.service'

const filter = ref<CashierFilter>({
  organizatorId: null,
  eventId: null,
  sessionId: null
})

const isWithoutSeat = ref(false)

const { startCountdown } = useCountDown()
const tarifId = ref<number | null>(null)
const ticketCount = ref<number | null>(null)
const isRender = ref(true)

const organizations = ref<OrganizationList[]>([])
const events = ref<CashEventModel[]>([])
const seans = ref<SessionModel[]>([])
const sessionTarifList = ref<TarifsModel[]>([])

const { t } = useI18n()

const store = useCashierStore()
const userStore = useUserStore()

const event = ref({
  eventBegin: '',
  palaceName: '',
  palaceHallName: '',
  eventName: ''
})

definePage({
  meta: {
    permission: PERMISSIONS.CASH_SOLD_TICKETS
  }
})

const fetchTarifList = async () => {
  if (!filter.value.sessionId) return
  try {
    const { data } = await getTariffList(filter.value.sessionId)
    sessionTarifList.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchOrderTicketList = async (isTrigger = false) => {
  try {
    if (isWithoutSeat.value) {
      const { data } = await addTicketWithoutSeat({ ticketCount: ticketCount.value!, ticketTarifId: tarifId.value! })
      data.result.forEach((item) => store.theatreTickets.push(item))
      toast.success(t('tickets.ticktesSuccessAdded'))
    } else {
      const { data } = await getOrderTicketList()
      data.result.forEach(obj => {
        obj.eventPrivilegesId = null;
      });
      store.theatreTickets = data.result
    }

    if (store.theatreTickets.length > 0 && !isTrigger) {
      startCountdown(store.theatreTickets[store.theatreTickets.length - 1].bookingTime)
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchOrganizationList = async () => {
  try {
    if (userStore.user?.structureId === STRUCTURES.TOUR_AGENT) {
      const { data } = await getMuseumList()
      organizations.value = data.result
      if (data.result.length > 0) {
        filter.value.organizatorId = data.result[0].orgId
        if (filter.value.organizatorId) {
          fetchEventList(filter.value.organizatorId)
        }
      }
    } else {
      const { data } = await getOrganizationList()
      organizations.value = data.result
      if (data.result.length > 0) {
        filter.value.organizatorId = data.result[0].orgId
        if (filter.value.organizatorId) {
          fetchEventList(filter.value.organizatorId)
        }
      }
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchEventList = async (organizatorId: number) => {
  try {
    if (userStore.user?.structureId === STRUCTURES.TOUR_AGENT) {
      const { data } = await GetEventListForTourAgent({ organizatorId })
      events.value = data.result
    } else {
      const { data } = await getCashierList(organizatorId)
      events.value = data.result
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchSessionList = async (eventId: number) => {
  try {
    const { data } = await getSessionTariffList(eventId)
    seans.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const updateMap = async () => {
  isRender.value = false
  await sleep(0.5)
  isRender.value = true
}

onMounted(async () => {
  await Promise.all([fetchOrderTicketList(), fetchOrganizationList()])
})

onUnmounted(() => {
  store.isBooking = false
})
</script>

<style lang="scss" scoped></style>
