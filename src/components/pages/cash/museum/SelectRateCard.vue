<template>
  <tr>
    <td>{{ item.name }}</td>
    <td>{{ formatMoney(item.price) }}</td>
    <td>
      <div class="custom-table__qnty">
        <button @click="() => updateItemQuantity(idx, item.count && item.count > 0 ? item.count - 1 : 0)">
          <i class="mdi mdi-minus"></i>
        </button>
        <div>
          <input type="number" :value="item.count" @input="($event) => handleInputQuantityChange(idx, $event)" min="0"
            max="1000" class="custom-table__qnty-input" />
        </div>
        <button @click="() => updateItemQuantity(idx, (item.count || 0) + 1)">
          <i class="mdi mdi-plus"></i>
        </button>
      </div>
    </td>
    <td>
      <v-select v-model="tarifList[idx].privilege" :items="privilagesList" :label="t('cash.selectFromList')"
        @update:model-value="calculateTotal(item)" dense hide-details color="indigo" item-value="id"
        :item-title="itemTitle" rounded="xl" density="comfortable" variant="outlined">
      </v-select>
    </td>
    <td>
      <p style="font-weight: 600; font-size: 16px">
        {{ formatMoney(Number(toFixed(correctPrice))) }}
      </p>
    </td>
    <td style="padding: 0" class="position-relative">
      <button class="custom-table__btn" @click="handleClear">
        <i class="mdi mdi-close"></i>
      </button>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { useCashierStore } from '@/stores/cashier.store'
import { TarifsModel } from '@/services/cash/model'
import { formatMoney } from '@/utils/functions'
import { getMuseumTicketSum, getTicketPrivRound } from '@/services/cash/cash.service'

const props = defineProps<{
  item: TarifsModel
  idx: number
}>()

const correctPrice = ref(0)

const { t } = useI18n()
const store = useCashierStore()
const { tarifList, privilagesList, isQuantityUpdated } = storeToRefs(store)

const itemTitle = (item: any) => `${item.name} (${item.rate}%)`;

const handleInputQuantityChange = (idx: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  updateItemQuantity(idx, value)
}

const handleClear = () => {
  updateItemQuantity(props.idx, 0)
  tarifList.value[props.idx].privilege = undefined
}

const updateItemQuantity = (index: number, newQuantity: number) => {
  if (newQuantity >= 1000 || newQuantity < 0) return
  isQuantityUpdated.value = true
  tarifList.value[index].count = newQuantity
  calculateTotal(tarifList.value[index])
}

const getRateFromPrivilageListById = (id: number): any => {
  const rate = privilagesList.value.find((item) => item.id === id)
  return rate ? rate.rate : ''
}

const calculateDiscountedTicketSum = async (ticketCount: number, ticketPrivilegesId: number | null, ticketTarifId: number) => {
  const { data: { result: discount } } = await getMuseumTicketSum(ticketCount, ticketPrivilegesId, ticketTarifId);
  return discount.ticketAllSum;
};

const calculateTotal = async (item: TarifsModel) => {
  const total = item.price * (item.count || 0)
  if (!tarifList.value[props.idx].privilege) {
    correctPrice.value = total
  } else {
    const discounted = await calculateDiscountedTicketSum(item.count || 0, tarifList.value[props.idx].privilege || null, item.id)
    correctPrice.value = discounted
  }
  // return discountedTotal.toFixed(2)
}

const toFixed = (num: number) => {
  return num.toFixed(2)
}
</script>
