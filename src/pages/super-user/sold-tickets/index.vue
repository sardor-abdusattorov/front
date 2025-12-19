<template>
  <base-page-layout :title="t('tickets.soldTickets')" :isLoading="loading">
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row class="d-flex align-end">
            <v-col cols="12" md="2">
              <base-select :label="t('tickets.organizers')" :placeholder="t('tickets.organizers')" color="indigo"
                :items="soldList" item-title="text" item-value="value" v-model="filter.orgId"
                @update:model-value="eventData" clearable hide-details></base-select>
            </v-col>
            <v-col cols="12" md="2">
              <base-select :label="t('tickets.event')" :placeholder="t('tickets.event')" color="indigo"
                :items="eventList" item-title="text" item-value="value" v-model="filter.eventId" clearable hide-details
                @update:model-value="seansData"></base-select>
            </v-col>
            <v-col cols="12" md="2">
              <base-select :items="seans" item-value="id" item-title="name" v-model="filter.sessionId"
                :placeholder="t('report.statisticsTicket.session')" :label="t('report.statisticsTicket.session')"
                @update:model-value="fetchData" />
            </v-col>
            <v-col cols="12" md="2">
              <base-input v-model="filter.orderSerial" :placeholder="t('tickets.orderNumber')"
                :label="t('tickets.orderNumber')" color="indigo" @update:model-value="serialNumberSearch"
                clearable></base-input>
            </v-col>
            <v-col cols="12" md="2">
              <base-input v-model="filter.ticketSerial" :placeholder="t('report.reportsTicket.ticketSerialNumber')"
                :label="t('report.reportsTicket.ticketSerialNumber')" color="indigo" @update:model-value="ticketSerialSearch"
                clearable></base-input>
            </v-col>
            <v-col cols="12" md="3" v-if="filter.sessionId">
              <v-dialog max-width="500px">
                <template v-slot:activator="{ props: activatorProps }">
                  <base-button v-bind="{ ...activatorProps, loading: cancelAllOrderLoading }"
                    class="d-flex align-center justify-center rounded-xl">
                    Отменить все заказы сеанса
                  </base-button>
                </template>
                <template v-slot:default="{ isActive }">
                  <v-card>
                    <template v-slot:text>
                      <div style="display: flex; flex-direction: column; gap: 10px">
                        <h2>{{ t('areYouRejectOrder') }}</h2>
                      </div>
                    </template>
                    <v-card-actions>
                      <base-button color="red" variant="flat" @click="isActive.value = false">{{
                        t('no')
                      }}</base-button>
                      <base-button color="primary" variant="flat" @click="cancelAllSessionOrders(isActive)">{{
                        t('yes')
                      }}</base-button>
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
      <v-card v-if="Array.isArray(dataList) && dataList.length > 0">
        <v-card-item>
          <s-u-expansion-panel v-for="list in dataList" :key="`${list.orderId}_${list.ticketList.length}`" :list="list"
            @fetchData="fetchData">
          </s-u-expansion-panel>
        </v-card-item>
      </v-card>
      <div v-else>
        <base-empty />
      </div>
      <v-pagination v-if="pagination.total && Array.isArray(dataList) && dataList.length > 0"
        class="mt-4 base-pagination" rounded="circle" density="comfortable" active-color="#8e24aa" total-visible="5"
        :value:model-value="pagination.page" :length="Math.ceil(pagination.total / pagination.perPage)"
        @update:model-value="pageClickHandler($event)"></v-pagination>
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { PERMISSIONS } from '@/constants/permissions'
import { debounce } from '@/utils/functions'
import { toast } from 'vue3-toastify'
import { getErrorMessage, scrollTop } from '@/utils/functions'
import { getCompanyAllList } from '@/services/organization/organization.service'
import { getAllEventByOrganizationId } from '@/services/events/events.service'
import { getSessionsByEvent } from '@/services/tarif/tarif.service'
import { cancelAllSessionOrdersBySessionID, getSoldTicketListForSU } from '@/services/super-user/super-user.service'

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS
  }
})

const { t } = useI18n()
const dataList = ref()
const cancelAllOrderLoading = ref(false)
const loading = ref(false)
const soldList = ref<any>()
const eventList = ref<any>([])
const seans = ref<any>([])
const filter = ref<any>({
  eventId: null,
  sessionId: null,
  orderSerial: null,
  ticketSerial: null, 
  orgId: null
})

const pagination = ref({
  page: 0,
  total: 0,
  perPage: 10
})

const cancelAllSessionOrders = async (isActive: any) => {
  cancelAllOrderLoading.value = true
  isActive.value = false
  try {
    await cancelAllSessionOrdersBySessionID(filter.value.sessionId)
    toast.success(t('tickets.orderCanceled'))
    await fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    cancelAllOrderLoading.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { data, total }
      }
    } = await getSoldTicketListForSU({
      skip: pagination.value.page,
      take: pagination.value.perPage,
      ...filter.value // ticketSerial уже будет включен
    })
    dataList.value = data
    pagination.value.total = total
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

const ticketSerialSearch = debounce(async () => {
  await fetchData()
}, 300)

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
  // if (filter.value.orgId && filter.value.sessionId && filter.value.eventId) {
  await fetchData()
  // }
}, 300)

const pageClickHandler = async (page: number) => {
  pagination.value.page = page - 1
  await fetchData()
  scrollTop()
}

watch(
  () => filter.value.orgId,
  () => {
    eventList.value = []
    filter.value.eventId = null
    fetchData()
  }
)

watch(
  () => filter.value.eventId,
  () => {
    seans.value = []
    dataList.value = []
    pagination.value.total = 0
    filter.value.sessionId = null
    filter.value.orderSerial = null
    fetchData()
  }
)

onMounted(async () => {
  await Promise.all([loadData(), fetchData()])
})
</script>

<style lang="scss">
@import '@/styles/pages/cash';
</style>
