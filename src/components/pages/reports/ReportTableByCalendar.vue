<template>
  <v-card class="pa-4 table-wrapper">
    <table>
      <thead>
      <tr>
        <th scope="col" rowspan="4">{{ t('commissionReport.id') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.date') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.venue') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.numberTicketsSold') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.numberTicketsReturn') }}</th>
      </tr>
      <tr>
        <th scope="col" colspan="2">{{ t('commissionReport.ticketAmount') }}</th>
        <th scope="col" rowspan="4">{{ t('commissionReport.commissionFee') }}</th>
      </tr>
      <tr>
        <th scope="col">{{ t('commissionReport.totalTicketsSold') }}</th>
        <th scope="col">{{ t('commissionReport.totalTicketsReturn') }}</th>
      </tr>

      </thead>

      <tbody v-if="tableData.length > 0">
      <template v-for="(dataItem, index) in tableData" :key="index">
        <tr>
          <td :rowspan="dataItem.length">{{ skip * take + index + 1 }}</td>
          <td :rowspan="dataItem.length">{{ dayjs(dataItem.date).format(DATE_VIEW_FORMAT) }}</td>
          <td :rowspan="dataItem.length">{{ dataItem.palace_name }}</td>
          <td :rowspan="dataItem.length">{{ dataItem.sold_count }}</td>
          <td :rowspan="dataItem.length">{{ dataItem.returned_count }}</td>
          <td :rowspan="dataItem.length">{{ formatMoney(dataItem.sold_summa) }}</td>
          <td :rowspan="dataItem.length">{{ formatMoney(dataItem.returned_summa) }}</td>
          <td :rowspan="dataItem.length">{{ formatMoney(dataItem.commission_summa) }}</td>
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
import { DATE_VIEW_FORMAT } from '@/constants/formats'

const { t } = useI18n()

const emit = defineEmits(['fetch'])

defineProps<{ tableData: any, skip: number, take: number, total: number }>()


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
