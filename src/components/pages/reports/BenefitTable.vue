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
                    <div>{{ benefits[('cashier' + capitalize(locale)) as keyof ReportBenefitDto] }}</div>
                  </div>
                </th>
                <th>
                  <div class="vs-table-text justify-content-start">
                    <span class="mr-2 text-black-50">{{ t('institution') }}: </span>
                    <div>{{ benefits[('palace' + capitalize(locale)) as keyof ReportBenefitDto] }}</div>
                  </div>
                </th>
                <th>
                  <div class="vs-table-text justify-content-start">
                    <span class="mr-2 text-black-50">{{ t('period') }}: </span>
                    <div>{{ benefits?.from }} - {{ benefits?.to }}</div>
                  </div>
                </th>
              </tr>
            </thead>
          </table>
          <table class="vs-table vs-table--tbody-table pb-5 top-table">
            <thead class="vs-table--thead">
              <tr>
                <th style="width: 50px">
                  <div class="vs-table-text">
                    <span>№</span>
                  </div>
                </th>
                <th style="width: 250px">
                  <div class="vs-table-text">
                    <span>{{ t('typeTicketService') }}</span>
                  </div>
                </th>
                <th style="width: 250px">
                  <div class="vs-table-text">
                    <span>{{ t('price') }}</span>
                  </div>
                </th>
                <th class="th" style="width: 250px">
                  <div class="vs-table-text">
                    <span>{{ t('benefit') }}</span>
                  </div>
                </th>
                <th class="th" style="width: 300px">
                  <div class="vs-table-text">
                    <span>{{ t('percent') }}</span>
                  </div>
                </th>
                <th class="th" style="width: 300px">
                  <div class="vs-table-text">
                    <span>{{ t('quantity') }}</span>
                  </div>
                </th>
                <th class="th" style="width: 300px">
                  <div class="vs-table-text">
                    <span>{{ t('sum') }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody v-for="event in benefits?.eventGroups" :key="event?.id">
              <tr>
                <td class="td vs-table--td top-table font-weight-bold" colspan="7">
                  <span>{{ event?.event }}</span>
                </td>
              </tr>
              <tr
                v-for="(item, idx) in event.tariffs"
                :key="item?.id"
                class="tr-values vs-table--tr tr-table-state-null"
              >
                <td class="td vs-table--td">
                  <span>{{ idx + 1 }}</span>
                </td>
                <td class="td vs-table--td">
                  <span>{{ item?.name }}</span>
                </td>
                <td class="td vs-table--td">
                  <span>{{ formatMoney(item?.price)}}</span>
                </td>
                <td class="td vs-table--td">
                  <span>{{ item?.privilege }}</span>
                </td>
                <td class="td vs-table--td">
                  <span>{{ item?.percent }}%</span>
                </td>
                <td class="td vs-table--td">
                  <span>{{ item?.total?.quantity }}</span>
                </td>
                <td class="td vs-table--td">
                  <span>{{ formatMoney(item?.total?.sum) }}</span>
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr style="font-weight: 700">
                <td colspan="5" class="td vs-table--td font-weight-bold">
                  <span class="font-weight-bold">{{ t('totals') }}</span>
                </td>
                <td class="td vs-table--td double" style="width: 250px">
                  <span>{{ totalQuantity }}</span>
                </td>
                <td class="td vs-table--td double" style="width: 250px">
                  <span>{{ formatMoney(totalSum) }}</span>
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
import { ReportBenefitDto } from '@/services/report-benefit/dto/report-benefit.dto'
import { TablePaginationType } from '@/types/table.types'
import { useI18n } from 'vue-i18n'
import { capitalize, formatMoney } from '../../../utils/functions'

const { t, locale } = useI18n()

const props = defineProps<{
  benefits: ReportBenefitDto
  pagination?: TablePaginationType
}>()
const totalQuantity = computed(() => {
  return props.benefits.eventGroups.reduce((total, event) => {
    return (
      total +
      event.tariffs.reduce((subTotal, item) => {
        return subTotal + (item.total?.quantity || 0)
      }, 0)
    )
  }, 0)
})

const totalSum = computed(() => {
  return props.benefits.eventGroups.reduce((total, event) => {
    return (
      total +
      event.tariffs.reduce((subTotal, item) => {
        return subTotal + (item.total?.sum || 0)
      }, 0)
    )
  }, 0)
})
</script>

<style lang="scss" scoped>
@import '@/assets/css/table.scss';
</style>
