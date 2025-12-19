<template>
  <div class="nd_body_block reports_by_tariffs">
    <div class="table-wrapper">
      <div class="vs-component vs-con-table table-dark-inverted vs-table-primary con-tablex vs-table--content">
        <div class="table-responsive vs-con-tbody vs-table--tbody">
          <table class="vs-table vs-table--tbody-table pb-5 top-table">
            <thead class="vs-table--thead">
              <tr>
                <th>
                  <div class="vs-table-text justify-content-start">
                    <span class="mr-2 text-black-50">{{ t('museum') }}: </span>
                    <div>{{ tariffs[('museum' + capitalize(locale)) as keyof ReportTariffDto] }}</div>
                  </div>
                </th>
                <th>
                  <div class="vs-table-text justify-content-start">
                    <span class="mr-2 text-black-50">{{ t('institution') }}: </span>
                    <div>{{ tariffs[('palace' + capitalize(locale)) as keyof ReportTariffDto] }}</div>
                  </div>
                </th>
                <th>
                  <div class="vs-table-text justify-content-start">
                    <span class="mr-2 text-black-50">{{ t('period') }}: </span>
                    <div>
                      {{ tariffs?.from }} -
                      {{ tariffs?.to }}
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
          </table>
          <table class="vs-table vs-table--tbody-table pb-5">
            <thead class="vs-table--thead">
              <tr>
                <th style="min-width: 250px">
                  <div class="vs-table-text">
                    <span>{{ t('typeTicketService') }}</span>
                  </div>
                </th>
                <th style="min-width: 150px">
                  <div class="vs-table-text">
                    <span>{{ t('price') }}</span>
                  </div>
                </th>
                <template v-if="Array.isArray(paymentTypes) && paymentTypes.length > 0">
                  <th class="th" style="width: 250px" v-for="payment in paymentTypes" :key="payment.id">
                    <div class="vs-table-text">
                      <span>{{ payment.name }}</span>
                    </div>
                    <div class="th-inline">
                      <div class="th-inline--block">
                        <span>{{ t('quantity_short') }} </span>
                      </div>
                      <div class="th-inline--block">
                        <span>{{ t('sum') }}</span>
                      </div>
                    </div>
                  </th>
                </template>
                <template v-if="Array.isArray(agents) && agents.length > 0">
                  <th class="th" style="min-width: 250px" v-for="agent in agents" :key="agent.id">
                    <div class="vs-table-text">
                      <span>{{ agent.name }}</span>
                    </div>
                    <div class="th-inline">
                      <div class="th-inline--block">
                        <span>{{ t('quantity_short') }} </span>
                      </div>
                      <div class="th-inline--block">
                        <span>{{ t('sum') }}</span>
                      </div>
                      <div class="th-inline--block" style="border-left: 1px solid #eee">
                        <span>{{ t('agent_commision') }}</span>
                      </div>
                    </div>
                  </th>
                </template>
                <th class="th" style="min-width: 300px">
                  <div class="vs-table-text">
                    <span>{{ t('total') }}</span>
                  </div>
                  <div class="th-inline">
                    <div class="th-inline--block">
                      <span>{{ t('quantity_short') }}</span>
                    </div>
                    <div class="th-inline--block">
                      <span>{{ t('sum') }}</span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody v-for="report in tariffs?.eventGroups" :key="report?.id">
              <tr>
                <td class="td vs-table--td top-table font-weight-bold" :colspan="calculateCollsapan">
                  <span>{{ report?.event }} {{ paymentTypes.length }} </span>
                </td>
              </tr>
              <tr v-for="item in report?.tariffs" :key="item?.id" class="tr-values vs-table--tr tr-table-state-null">
                <td class="td vs-table--td">
                  <span>{{ item?.name }}</span>
                </td>
                <td class="td vs-table--td">
                  <span>{{ formatMoney(item?.price) }}</span>
                </td>
                <td
                  class="td vs-table--td double"
                  style="min-width: 250px"
                  v-for="payment in paymentTypes"
                  :key="payment.id"
                >
                  <div class="divided">
                    <span>{{ getQuantity(item.paymentTypes, payment) }}</span>
                    <span>{{ getSum(item.paymentTypes, payment) }}</span>
                  </div>
                </td>
                <td class="td vs-table--td double" style="min-width: 250px" v-for="agent in agents" :key="agent.id">
                  <div class="divided triple-divided">
                    <span>{{ getQuantity(item.agents, agent) }}</span>
                    <span>{{ getSum(item.agents, agent) }}</span>
                    <span>{{ getSum(item.agents, agent, 'agentSum') }}</span>
                  </div>
                </td>

                <td class="td vs-table--td double">
                  <div class="divided">
                    <span>{{ item.total.quantity }}</span>
                    <span>{{ formatMoney(item.total.sum) }}</span>
                  </div>
                </td>
              </tr>

              <tr style="font-weight: 700">
                <td colspan="2" class="td vs-table--td font-weight-bold">
                  <span class="font-weight-bold">{{ t('total') }}</span>
                </td>
                <td class="td vs-table--td double" style="min-width: 250px" v-for="item in paymentTypes" :key="item.id">
                  <div class="divided">
                    <span>{{ report.total[item.name] ? report.total[item.name].quantity : 0 }}</span>
                    <span>{{ report.total[item.name] ? formatMoney(report.total[item.name].sum) : 0 }}</span>
                  </div>
                </td>
                <td class="td vs-table--td double" style="min-width: 250px" v-for="item in agents" :key="item.id">
                  <div class="divided triple-divided">
                    <span>{{ report.total[item.name] ? report.total[item.name].quantity : 0 }}</span>
                    <span>{{ report.total[item.name] ? formatMoney(report.total[item.name].sum) : 0 }}</span>
                    <span>{{ report.total[item.name] ? formatMoney(report.total[item.name].agentSum) : 0 }}</span>
                  </div>
                </td>
                <td class="td vs-table--td double">
                  <div class="divided">
                    <span>{{ report.total.quantity }}</span>
                    <span>{{ formatMoney(report.total.sum) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr style="font-weight: 700">
                <td colspan="2">
                  <span>{{ t('totals') }}</span>
                </td>
                <td class="td vs-table--td double" v-for="item in paymentTypes" :key="item.id">
                  <div class="divided">
                    <span>{{ totals[item.name] ? totals[item.name].quantity : 0 }}</span>
                    <span>{{ totals[item.name] ? formatMoney(totals[item.name].sum) : 0 }}</span>
                  </div>
                </td>
                <td class="td vs-table--td double" v-for="item in agents" :key="item.id">
                  <div class="divided triple-divided">
                    <span>{{ totals[item.name] ? totals[item.name].quantity : 0 }}</span>
                    <span>{{ totals[item.name] ? formatMoney(totals[item.name].sum) : 0 }}</span>
                    <span>{{ totals[item.name] ? formatMoney(totals[item.name].agentSum) : 0 }}</span>
                  </div>
                </td>
                <td class="td vs-table--td double">
                  <div class="divided">
                    <span>{{ totals.quantity }}</span>
                    <span>{{ formatMoney(totals.sum) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <v-pagination
      v-if="pagination && pagination.total > 1"
      class="base-pagination"
      rounded="circle"
      density="comfortable"
      active-color="#8e24aa"
      total-visible="5"
      :value:model-value="pagination.page"
      :length="pagination.total"
      @update:model-value="pagination.pageClickHandler($event)"
    ></v-pagination>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { ReportTariffDto, TotalsType } from '@/services/report-tariff/dto/report-tariff.dto'

import { capitalize, formatMoney } from '@/utils/functions'
import { PaymentType } from '@/services/report-tariff/dto/report-tariff.dto'
import { useDisplay } from 'vuetify'
import { TablePaginationType } from '@/types/table.types'

defineProps<{
  tariffs: ReportTariffDto
  paymentTypes: PaymentType[]
  agents: PaymentType[]
  totals: TotalsType
  pagination?: TablePaginationType
}>()

const { t, locale } = useI18n()
const emit = defineEmits(['pageClick'])

const display = useDisplay()

const calculateCollsapan = computed(() => {
  return display.width.value > 1280 && display.width.value < 1450
    ? 5
    : display.width.value < 1280 && display.width.value > 575
      ? 3
      : display.width.value < 575
        ? 2
        : 6
})

const getQuantity = (arr: any[], item: { name: string; id: number }) => {
  if (!arr || arr.length === 0) return '-'
  const i = arr.findIndex((x: any) => x.id === item.id)

  return i > -1 ? formatMoney(arr[i].quantity) : '-'
}
const getSum = (arr: any[], item: { name: string; id: number }, key: string = 'sum') => {
  if (!arr || arr.length === 0) return '-'
  const i = arr.findIndex((x: any) => x.id === item.id)

  return i > -1 ? formatMoney(arr[i][key]) : '-'
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/table.scss';
</style>
