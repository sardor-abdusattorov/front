<template>
  <v-card class="pa-4 table-wrapper">
    <table>
      <thead>
      <tr>
        <th scope="col" rowspan="4">{{ t('commissionReport.id') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.date') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.time') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.sessionID') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.performanceName') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.institution_name') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.price') }}</th>
        <th scope="col" rowspan="3" colspan="2">{{ t('commissionReport.plannedPlacesForSale') }}</th>
        <th scope="col" :colspan="14 + agentListHeader.length * 3">{{ t('commissionReport.ticketsSoldPerMonth') }}
        </th>
        <th scope="col" rowspan="3" colspan="2">{{ t('commissionReport.ticketsSold') }}</th>
        <th scope="col" rowspan="3" colspan="2">{{ t('commissionReport.unsoldSeats') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.fund') }}</th>
      </tr>
      <tr>
        <th scope="col" rowspan="2" colspan="2">{{ t('commissionReport.enumeration') }}</th>
        <th scope="col" colspan="12">{{ t('commissionReport.soldAtCheckout') }}</th>
        <th scope="col" v-if="agentListHeader.length > 0" :colspan="agentListHeader.length * 3">
          {{ t('commissionReport.soldThroughAgents') }}
        </th>
      </tr>
      <tr>
        <th scope="col" colspan="2">{{ t('commissionReport.cashPayment') }}</th>
        <th scope="col" colspan="2">{{ t('commissionReport.terminal') }}</th>
        <th scope="col" colspan="2">{{ t('commissionReport.free') }}</th>
        <th scope="col" colspan="2">{{ t('commissionReport.payme') }}</th>
        <th scope="col" colspan="2">{{ t('commissionReport.click') }}</th>
        <th scope="col" colspan="2">{{ t('commissionReport.uzum_bank') }}</th>
        <template v-if="agentListHeader.length > 0">
          <th v-for="(agent, i) in agentListHeader" colspan="3" :key="i">{{ agent.agentName }}</th>
        </template>
      </tr>
      <tr>
        <template v-for="_ of iterations" :key="_">
          <th scope="col" class="nowrap">{{ t('commissionReport.quantity') }}</th>
          <th scope="col">{{ t('commissionReport.sum') }}</th>
        </template>
        <template v-for="_ in agentListHeader" :key="_">
          <th class="nowrap">{{ t('commissionReport.quantity') }}</th>
          <th>{{ t('commissionReport.sum') }}</th>
          <th>{{ t('agent_commision') }}</th>
        </template>
        <th scope="col" class="nowrap">{{ t('commissionReport.quantity') }}</th>
        <th scope="col">{{ t('commissionReport.sum') }}</th>
        <th scope="col" class="nowrap">{{ t('commissionReport.quantity') }}</th>
        <th scope="col">{{ t('commissionReport.sum') }}</th>
      </tr>

      </thead>
      <tbody v-if="tableData.length > 0">
      <template v-for="(dataItem, index) in tableData" :key="index">
        <tr v-for="(columnItem, counterIndex) in dataItem" :key="counterIndex">

          <template v-if="counterIndex == 0">
            <td :rowspan="dataItem.length">{{ skip * take + index + 1 }}</td>
            <td :rowspan="dataItem.length">{{ dayjs(columnItem.eventDate).format(DATE_VIEW_FORMAT) }}</td>
            <td :rowspan="dataItem.length">{{ dayjs(columnItem.eventDate).format(TIME_FORMAT) }}</td>
            <td :rowspan="dataItem.length">{{ columnItem.sessionId }}</td>
            <td :rowspan="dataItem.length">{{ columnItem.eventName }}</td>
            <td :rowspan="dataItem.length">{{ columnItem.palaceOrgName }}</td>
          </template>

          <td>{{ columnItem.ticketPrice }}</td>
          <td>{{ columnItem.ticketPlanCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.ticketPlanSum) }}</td>
          <td>{{ columnItem.ticketBankCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.ticketBankSum) }}</td>
          <td>{{ columnItem.ticketCashCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.ticketCashSum) }}</td>
          <td>{{ columnItem.ticketCardCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.ticketCardSum) }}</td>
          <td class="nowrap">{{ columnItem.ticketFreeCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.ticketFreeSum) }}</td>
          <td class="nowrap">{{ columnItem.ticketPaymeCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.ticketPaymeSum) }}</td>
          <td class="nowrap">{{ columnItem.ticketClickCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.ticketClickSum) }}</td>
          <td class="nowrap">{{ columnItem.ticketUzumBankCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.ticketUzumBankSum) }}</td>

          <template v-for="agent in agentListHeader" :key="agent.agentId">
            <td>{{ formatMoney(getAgentColumnData(columnItem, agent, 'ticketCount')) }}</td>
            <td class="nowrap">{{ formatMoney(getAgentColumnData(columnItem, agent, 'ticketSum')) }}</td>
            <td class="nowrap">{{ formatMoney(getAgentColumnData(columnItem, agent, 'ticketAgentSum')) }}</td>
          </template>

          <td>{{ columnItem.soldTicketsCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.soldTicketsSum) }}</td>
          <td>{{ columnItem.unsoldTicketsCount }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.unsoldTicketsSum) }}</td>
          <td class="nowrap">{{ formatMoney(columnItem.commission) }}</td>
        </tr>
        <tr>
          <td colspan="7" style="font-weight: 600; text-align: left">{{ t('total') }}:</td>
          <td class="nowrap" v-for="(sum,i) of calculateSummary(dataItem)" :key="i" style="font-weight: 600">
            {{ formatMoney(sum) }}
          </td>
          <template v-for="agent in agentListHeader" :key="agent.agentId">
            <td class="nowrap" v-for="(sum, i) of getAgentTotalData(dataItem, agent)" :key="i">
              {{ formatMoney(sum) }}
            </td>
          </template>
          <td class="nowrap" v-for="(sum,i) in calculateSummary(dataItem, 2)" :key="i" style="font-weight: 600">
            {{ formatMoney(sum) }}
          </td>
        </tr>
      </template>
      </tbody>

    </table>
    <v-pagination
      v-if="total > take"
      class="base-pagination"
      rounded="circle"
      density="comfortable"
      active-color="#8e24aa"
      total-visible="5"
      :value:model-value="skip"
      :length="Math.ceil(total ? total / take : 0)"
      @update:model-value="emit('fetch', $event)"
    ></v-pagination>
  </v-card>
</template>

<script setup lang="ts">
import { formatMoney } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { DATE_VIEW_FORMAT, TIME_FORMAT } from '@/constants/formats'
import { AgentListHeader, AgentTicket, ReportsByMonthModel } from '@/services/report-by-month/model'

const { t } = useI18n()

const emit = defineEmits(['fetch'])

defineProps<{ tableData: ReportsByMonthModel[][], agentListHeader: AgentListHeader[], skip:number, take:number , total:number}>()

const iterations = ref<number[]>(Array(8).fill(0))


const calculateSummary = (items: ReportsByMonthModel[], side = 1) => {
  let summary = null

  if (side == 1) {
    summary = {
      planCount: items.reduce((old, item) => old + item.ticketPlanCount, 0),
      ticketPlanSum: items.reduce((old, item) => old + item.ticketPlanSum, 0),
      ticketBankCount: items.reduce((old, item) => old + item.ticketBankCount, 0),
      ticketBankSum: items.reduce((old, item) => old + item.ticketBankSum, 0),
      ticketCashCount: items.reduce((old, item) => old + item.ticketCashCount, 0),
      ticketCashSum: items.reduce((old, item) => old + item.ticketCashSum, 0),
      ticketCardCount: items.reduce((old, item) => old + item.ticketCardCount, 0),
      ticketCardSum: items.reduce((old, item) => old + item.ticketCardSum, 0),
      ticketFreeCount: items.reduce((old, item) => old + item.ticketFreeCount, 0),
      ticketFreeSum: items.reduce((old, item) => old + item.ticketFreeSum, 0),
      ticketPaymeCount: items.reduce((old, item) => old + item.ticketPaymeCount, 0),
      ticketPaymeSum: items.reduce((old, item) => old + item.ticketPaymeSum, 0),
      ticketClickCount: items.reduce((old, item) => old + item.ticketClickCount, 0),
      ticketClickSum: items.reduce((old, item) => old + item.ticketClickSum, 0),
      ticketUzumBankCount: items.reduce((old, item) => old + item.ticketUzumBankCount, 0),
      ticketUzumBankSum: items.reduce((old, item) => old + item.ticketUzumBankSum, 0)
    }
  } else {
    summary = {
      soldTicketsCount: items.reduce((old, item) => old + item.soldTicketsCount, 0),
      soldTicketsSum: items.reduce((old, item) => old + item.soldTicketsSum, 0),
      unsoldTicketsCount: items.reduce((old, item) => old + item.unsoldTicketsCount, 0),
      unsoldTicketsSum: items.reduce((old, item) => old + item.unsoldTicketsSum, 0),
      commission: items.reduce((old, item) => old + item.commission, 0)
    }
  }

  return Object.values(summary)
}
const getAgentColumnData = (columnItem: ReportsByMonthModel, item: AgentListHeader, type: keyof AgentTicket) => {
  let a = columnItem.agentTickets.find((elem) => +elem.agentId === +item.agentId)
  return a ? a[type] : 0
}
const getAgentTotalData = (dataItem: ReportsByMonthModel[], agentData: AgentListHeader) => {
  let sum = { count: 0, sum: 0, agentSum: 0 }
  dataItem.forEach((item) => {
    sum.count += getAgentColumnData(item, agentData, 'ticketCount')
    sum.sum += getAgentColumnData(item, agentData, 'ticketSum')
    sum.agentSum += getAgentColumnData(item, agentData, 'ticketAgentSum')
  })
  return Object.values(sum)
}


</script>

<style scoped>
.table-wrapper {
  width: fit-content;
}

table {
  border-collapse: collapse;
  width: 100%;
  font-size: 14px;

  td,
  th {
    border: 1px solid #eee;
    padding: 6px 8px;
    font-weight: 500;
    white-space: nowrap;
  }

  td {
    font-weight: 400;
    text-align: center;
    white-space: wrap;
  }

  .nowrap {
    white-space: nowrap;
  }
}

.base-pagination {
  position: sticky;
  bottom: 0;
  left: 0;
  width: calc(100vw - 282px);
}
</style>
