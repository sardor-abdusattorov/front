<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <ul>
      <li>
        <span>{{ t('commissionReport.time') }}: </span>
        {{ ticket?.payDate }}
      </li>
      <li>
        <span>{{ t('sold_tickets.table.event') }}: </span>
        {{ ticket?.eventName }}
      </li>
      <li>
        <span>{{ t('sold_tickets.table.palace') }}: </span>
        {{ ticket?.palaceName }}
      </li>
      <li>
        <div class="list-inner">
          <span>{{ t('schema.sector') }}: </span>
          {{ ticket?.sectorName }}
        </div>
        <div class="list-inner">
          <span>{{ t('sold_tickets.table.seat') }}:</span> {{ ticket?.row }}/{{ ticket?.seat }}
        </div>
      </li>
      <li>
        <div class="list-inner">
          <span>{{ t('report.reportsTicket.orderNumber') }}: </span>
          №{{ ticket?.orderId }}
        </div>
        <div class="list-inner">
          <span>{{ t('report.statisticsTicket.status') }}: </span>
          {{ status === 'bought' ? t('tickets.bought') : t('tickets.for_exchange') }}
        </div>
      </li>
      <li>
        <div class="list-inner">
          <span>{{ t('date') }}: </span>
          {{ ticket?.time }} - {{ ticket?.day }}.{{ ticket?.month }}.{{ ticket?.year }}
        </div>
        <div class="list-inner">
          <span>{{ t('price') }}: </span>
          {{ formatMoney(ticket?.ticketSum) }} {{ ticket?.currency }}
        </div>
      </li>
    </ul>
    <div><slot /></div>
  </div>
</template>

<script lang="ts" setup>
import { TicketModel } from '@/services/ticket/model/ticker.model'
import { formatMoney } from '@/utils/functions'
import { useI18n } from 'vue-i18n'

defineProps<{ title: string; ticket: TicketModel; status: 'bought' | 'to-swap' }>()

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.card {
  flex-grow: 1;

  &:not(:first-child) {
    padding: 10px 0;
    border-top: 1px solid #e0e0e0;
  }

  h2 {
    font-size: 16px;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 3px;
    li {
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      span {
        font-weight: 500;
      }
      .list-inner {
        width: 50%;
      }
    }
  }
}
</style>
