<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:model-value', $event)"
    max-width="700"
    width="90%"
  >
    <v-card>
      <template #title> {{ t('total_sum') }}: {{ formatMoney(eventSessionVal?.allSum) }} UZS </template>
      <template #text>
        <v-divider class="mb-5"></v-divider>
        <table>
          <thead>
            <tr>
              <th>{{ t('contract.status') }}</th>
              <th>{{ t('report.reportsTicket.sum') }} UZS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="list in eventSessionVal.list" :key="list.eventSessionId">
              <td>{{ list.ticketStatusName }}</td>
              <td>{{ formatMoney(list.sum) }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-slot:actions>
        <v-btn class="ms-auto" :text="t('actions.close')" @click="emit('update:model-value', false)"></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { EventListModel } from '@/services/tarif/model/tarif.model'
import { formatMoney } from '@/utils/functions'
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{ modelValue: boolean; eventSessionVal: EventListModel }>(), {
  eventSessionVal: () => {
    return {
      allSum: 0,
      list: []
    }
  }
})
const emit = defineEmits(['update:model-value'])
const { t } = useI18n()
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;

  th {
    color: #909090;
  }

  th,
  td {
    padding: 12px 8px;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }
}
</style>
