<template>
  <v-card style="height: 250px; padding-top: 10px">
    <template v-slot:text>
      <div style="display: flex; flex-direction: column; gap: 10px">
        <h2>{{ t('areYouReturnTicket') }}</h2>
        <p>
          {{ t('tickets.refundOfTheAmount') }}:
          <span>{{ formatMoney(rejectTicketInfo?.rejectSum!) }}</span>
        </p>
        <p>
          {{ t('sold_tickets.table.fineAmount') }}:
          <span>{{ formatMoney(rejectTicketInfo?.fineSum!) }}</span>
        </p>
      </div>
    </template>
    <v-card-actions>
      <base-button color="red" variant="flat" @click="emit('close')">{{ t('no') }}</base-button>
      <base-button color="primary" variant="flat" @click="emit('reject')">{{ t('yes') }}</base-button>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
import { formatMoney } from '@/utils/functions'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ rejectTicketInfo: { rejectSum: number; fineSum: number } }>()
const emit = defineEmits(['close', 'reject'])
</script>
