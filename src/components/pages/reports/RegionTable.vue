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
                    <div>{{ regions[('palace' + capitalize(locale)) as keyof ReportRegionDto] }}</div>
                  </div>
                </th>
                <th>
                  <div class="vs-table-text justify-content-start">
                    <span class="mr-2 text-black-50">{{ t('period') }}: </span>
                    <div>{{ regions?.from }} - {{ regions?.to }}</div>
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
                <th class="th" style="width: 300px">
                  <div class="vs-table-text">
                    <span>{{ t('region') }}</span>
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
            <tbody>
              <tr
                v-for="(item, idx) in regions.items"
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
                  <span>{{ formatMoney(item?.quantity) }}</span>
                </td>
                <td class="td vs-table--td">
                  <span>{{ formatMoney(item?.sum) }}</span>
                </td>
              </tr>
            </tbody>
            <tbody>
              <tr style="font-weight: 700">
                <td colspan="2" class="td vs-table--td font-weight-bold">
                  <span class="font-weight-bold">{{ t('totals') }}</span>
                </td>
                <td class="td vs-table--td double" style="width: 250px">
                  <span>{{ formatMoney(quantityTotal) }}</span>
                </td>
                <td class="td vs-table--td double" style="width: 250px">
                  <span>{{ formatMoney(sumTotal) }}</span>
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
import { ReportRegionDto } from '@/services/report-region/dto/report-region.dto'
import { TablePaginationType } from '@/types/table.types'
import { capitalize, formatMoney } from '@/utils/functions'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps<{
  regions: ReportRegionDto
  pagination?: TablePaginationType
}>()

const quantityTotal = computed(() => {
  return props.regions.items.reduce((total, item) => total + (item?.quantity || 0), 0)
})

const sumTotal = computed(() => {
  return props.regions.items.reduce((total, item) => total + (item?.sum || 0), 0)
})
</script>

<style lang="scss" scoped>
@import '@/assets/css/table.scss';
</style>
