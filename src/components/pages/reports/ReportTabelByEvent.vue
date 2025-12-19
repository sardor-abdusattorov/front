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
        </tr>
        <tr>
          <th scope="col" colspan="2">{{ t('commissionReport.plannedPlacesForSale') }}</th>
          <th scope="col" colspan="2">{{ t('commissionReport.ticketsSold') }}</th>
          <th scope="col" colspan="2">{{ t('commissionReport.unsoldTickets') }}</th>
        </tr>

        <tr>
          <template v-for="_ of iterations" :key="_">
            <th scope="col" class="nowrap">{{ t('commissionReport.quantity') }}</th>
            <th scope="col">{{ t('commissionReport.sum') }}</th>
          </template>
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
            <td>{{ columnItem.soldTicketsCount }}</td>
            <td class="nowrap">{{ formatMoney(columnItem.soldTicketsSum) }}</td>
            <td>{{ columnItem.unsoldTicketsCount }}</td>
            <td class="nowrap">{{ formatMoney(columnItem.unsoldTicketsSum) }}</td>
          </tr>
          <tr>
            <td colspan="7" style="font-weight: 600; text-align: left">{{ t('total') }}:</td>
            <td class="nowrap" v-for="(sum, i) of calculateSummary(dataItem)" :key="i" style="font-weight: 600">
              {{ formatMoney(sum) }}
            </td>
            <td class="nowrap" v-for="(sum, i) in calculateSummary(dataItem, 2)" :key="i" style="font-weight: 600">
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
import { ReportsByMonthModel } from '@/services/report-by-month/model'

const { t } = useI18n()

const emit = defineEmits(['fetch'])

defineProps<{ tableData: ReportsByMonthModel[][]; skip: number; take: number; total: number }>()

const iterations = ref<number[]>(Array(3).fill(0))

const calculateSummary = (items: ReportsByMonthModel[], side = 1) => {
  let summary = null

  if (side == 1) {
    summary = {
      planCount: items.reduce((old, item) => old + item.ticketPlanCount, 0),
      ticketPlanSum: items.reduce((old, item) => old + item.ticketPlanSum, 0)
    }
  } else {
    summary = {
      soldTicketsCount: items.reduce((old, item) => old + item.soldTicketsCount, 0),
      soldTicketsSum: items.reduce((old, item) => old + item.soldTicketsSum, 0),
      unsoldTicketsCount: items.reduce((old, item) => old + item.unsoldTicketsCount, 0),
      unsoldTicketsSum: items.reduce((old, item) => old + item.unsoldTicketsSum, 0)
    }
  }

  return Object.values(summary)
}
</script>

<style scoped>
.table-wrapper {
  width: 100%;
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
