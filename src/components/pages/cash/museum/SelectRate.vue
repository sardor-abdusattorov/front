<template>
  <v-card-item>
    <v-card-title class="pb-3">
      {{ t('cash.selectRate') }}
    </v-card-title>

    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th
              v-for="header in headers"
              :key="header.key"
              :style="`min-width: ${header.minWith}px;max-width: ${header.maxWith}px`"
            >
              {{ header.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <select-rate-card
            v-for="(item, idx) in tariffsWithCount"
            :key="item.id"
            :item="item"
            :idx="idx"
            :privilagesList="privilagesList"
          />
        </tbody>
      </table>
    </div>

    <div style="gap: 20px; padding: 0 4px" class="custom-rate__select">
      <v-autocomplete
        :items="countryList"
        :label="t('cash.selectCountry')"
        v-model="payload.countryId"
        dense
        clearable
        hide-details
        item-value="value"
        :item-title="`name${capitalize(locale)}`"
        variant="outlined"
        rounded="xl"
        searchable
      >
      </v-autocomplete>
      <v-autocomplete
        :items="regionList"
        :label="t('cash.selectRegion')"
        :disabled="!payload.countryId || payload.countryId !== 1"
        v-model="payload.regionId"
        dense
        clearable
        hide-details
        item-value="value"
        :item-title="`name${capitalize(locale)}`"
        variant="outlined"
        rounded="xl"
      >
      </v-autocomplete>
    </div>
    <v-divider style="margin: 1rem 0" />
    <div class="my-8">
      <v-card-title class="pb-3">{{ t('cash.chooseAPaymentMethod') }}</v-card-title>
      <v-card-actions class="cash-custom">
        <button
          v-for="item in filteredPaymentTypes"
          @click="handlePaymentTypeId(item.id)"
          :class="{ active: payload.paymentTypeId === item.id }"
          class="cash-custom__button"
          :key="item.id"
        >
          {{ item[('name' + capitalize(locale)) as keyof PaymentTypeDto] }}
        </button>
      </v-card-actions>
    </div>
    <v-divider style="margin: 1rem 0" />
    <div class="d-flex flex-wrap justify-space-between align-center">
      <div class="custom-rate__total">
        <v-card-text
          >{{ t('cash.totalTickets') }}:

          <p>{{ tariffsWithCount.reduce((acc, item) => acc + (item.count || 0), 0) }}</p></v-card-text
        >
        <v-card-text>
          {{ t('cash.toBePaid') }}:
          <p>
            {{ formatMoney(getTotalSum) }}
          </p>
        </v-card-text>
      </div>
      <v-checkbox
        v-if="isQuantityUpdated && totalQuantityBigThanOne"
        color="primary"
        v-model="payload.isMultiple"
        :label="t('tickets.multiUseTicket')"
      />
      <div class="cash-pay-btn">
        <base-button @click="handlePayment" size="x-large" variant="flat" rounded="lg" :disabled="disabled">
          {{ t('cash.toPay') }}
        </base-button>
      </div>
    </div>
  </v-card-item>

  <div style="position: absolute; z-index: -10" v-if="isTicketVisible">
    <vue-to-print :content="ticketComponentRef" remove-after-print>
      <template #trigger>
        <button ref="buttonToPrintRef"></button>
      </template>
    </vue-to-print>
    <div ref="ticketComponentRef">
      <museium-ticket />
    </div>
  </div>
</template>
<script setup lang="ts">
import { VueToPrint } from 'vue-to-print'
import { useI18n } from 'vue-i18n'

import { capitalize, formatMoney } from '@/utils/functions'
import { storeToRefs } from 'pinia'

import { TarifsModel } from '@/services/cash/model'
import { useCashierStore } from '@/stores/cashier.store'
import { toast } from 'vue3-toastify'
import { PaymentTypeDto } from '@/services/region/dto/region.dto'

const FREE_PAYMENT_TYPE_ID = 6

const { t, locale } = useI18n()
const cashierStore = useCashierStore()
const isTicketVisible = ref(false)
const ticketComponentRef = ref()
const buttonToPrintRef = ref()
const totalQuantityBigThanOne = computed(() => {
  const total = tariffsWithCount.value.reduce((acc, item) => acc + (item.count || 0), 0)
  return total > 1
})
const disabled = ref(false)

const { loadCashierData, fetchRegionList, addCashierMuseium } = cashierStore
const {
  payload,
  countryList,
  regionList,
  paymentListData,
  tariffsWithCount,
  privilagesList,
  isQuantityUpdated,
  isSuccessPayment
} = storeToRefs(cashierStore)

const handlePaymentTypeId = (id: number) => {
  payload.value.paymentTypeId = id
}

const filteredPaymentTypes = computed(() => {
  if (isQuantityUpdated.value && getTotalSum.value === 0) {
    return paymentListData.value.filter((item) => item.id === FREE_PAYMENT_TYPE_ID)
  }
  return paymentListData.value
})


const getRateFromPrivilageListById = (id: number): any => {
  const rate = privilagesList.value.find((item) => item.id === id)
  return rate ? rate.rate : ''
}

watch(
  () => tariffsWithCount.value,
  () => {
    if (tariffsWithCount.value.every((item) => item.count === 0)) {
      isQuantityUpdated.value = false
    }

    payload.value.isMultiple = totalQuantityBigThanOne.value
  },
  { deep: true }
)


watch(
  () => payload.value.countryId,
  () => {
    payload.value.regionId = null
    regionList.value = []
    if (payload.value.countryId === 1) {
      fetchRegionList()
    }
  }
)

const handlePayment = async () => {
  const ticketTariflist = tariffsWithCount.value.filter((item) => item.count && item.count > 0)

  payload.value.ticketTariflist = ticketTariflist.map((item) => ({
    ticketCount: item.count || 0,
    ticketPrivilegesId: getPrivilate(item.privilege)?.id || null,
    ticketTarifId: item.id
  }))

  if (payload.value.ticketTariflist.length === 0) {
    return toast.error(t('cash.selectTicket'))
  }

  if (payload.value.countryId === 1 && !payload.value.regionId) {
    return toast.error(t('cash.selectRegion'))
  }

  if (!payload.value.paymentTypeId) {
    return toast.error(t('cash.chooseAPaymentMethod'))
  }
  isTicketVisible.value = true
  disabled.value = true
  await addCashierMuseium(payload.value)

  if (isSuccessPayment.value) {
    buttonToPrintRef.value.click()
  }
  isTicketVisible.value = false
  disabled.value = false
}

const getPrivilate = (privilege: number | null | undefined) => {
  return privilagesList.value.find((item) => item.id === privilege) || null
}

const getTotalSum = computed(() => {
  return tariffsWithCount.value.reduce((acc, item) => acc + parseFloat(calculateTotal(item)), 0)
})


const calculateTotal = (item: TarifsModel): string => {
  const total = item.price * (item.count || 0)
  const discountedTotal = item.privilege ? total - total * getRateFromPrivilageListById(item.privilege) * 0.01 : total
  return discountedTotal.toFixed(2)
}

const headers = ref([
  {
    title: t('cash.rate'),
    align: 'start',
    sortable: false,
    key: 'rate',
    minWith: 300,
    maxWith: null
  },
  {
    title: t('cash.price'),
    align: 'end',
    key: 'price',
    minWith: 150,
    maxWith: null
  },
  {
    title: t('cash.quantity'),
    align: 'end',
    key: 'quantity',
    minWith: 200,
    maxWith: 200
  },
  {
    title: t('cash.benefits'),
    align: 'end',
    key: 'benefit',
    minWith: 300,
    maxWith: 300
  },
  {
    title: t('cash.total'),
    align: 'end',
    key: 'total',
    minWith: 150,
    maxWith: 200
  },
  {
    title: '',
    value: 'action',
    align: 'end',
    key: 'action',
    minWith: 70,
    maxWith: 70
  }
])

loadCashierData()
</script>

<style lang="scss">
@import '@/styles/pages/cash';
</style>
