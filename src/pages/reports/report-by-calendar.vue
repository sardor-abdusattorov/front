<template>
  <base-page-layout :title="t('reports.reportByCalendar')" :isLoading="loading">
    <template #filter>
      <v-card class="pa-4">
        <v-row>
          <v-col cols="12" md="4" class="base-select">
            <base-date-input :label="t('tickets.selectDate')" color="indigo"
                          clearable multiple="range" density="compact" v-model="date" />
          </v-col>

          <v-col cols="12" md="8" class="d-flex justify-end align-end">
            <base-button @click="downloadExcel" v-if="tableData.length > 0" prepend-icon="mdi-microsoft-excel">{{
                t('downExcel')
              }}
            </base-button>
          </v-col>
        </v-row>
      </v-card>
    </template>
    <template #content>
      <ReportTableByCalendar :table-data="tableData" :skip="skip"
                             :take="take"
                             :total="total" @fetch="pageClickHandler($event)" />
      <base-empty class="empty" v-if="tableData.length === 0 && !loading" />
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { PERMISSIONS } from '@/constants/permissions'
import { downloadBlobAsFile, getErrorMessage } from '@/utils/functions'

import { ReportsByMonthModel } from '@/services/report-by-month/model'
import ReportTableByCalendar from '@/components/pages/reports/ReportTableByCalendar.vue'
import { getExcelReports, getReports } from '@/services/report-ticket/report-ticket.service'
import dayjs from 'dayjs'


const { t } = useI18n()

const tableData = ref<ReportsByMonthModel[][]>([])
const total = ref(0)
const loading = ref(false)
const take = ref(10)
const skip = ref(0)
const date = ref([])


const downloadExcel = async () => {
  try {
    const { data } = await getExcelReports({
      date1: dayjs(date.value[0]).format('DD.MM.YYYY'),
      date2: dayjs(date.value[date.value.length - 1]).format('DD.MM.YYYY'),
      skip: skip.value,
      take: take.value

    })

    downloadBlobAsFile(data, 'Reports.xlsx')
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const fetchData = async () => {
  try {
    loading.value = true
    const { data } = await getReports({
      date1: dayjs(date.value[0]).format('DD.MM.YYYY'),
      date2: dayjs(date.value[date.value.length - 1]).format('DD.MM.YYYY'),
      skip: skip.value,
      take: take.value
    })

    total.value = data.result.total
    tableData.value = data.result.data


  } catch (e) {
    toast.error(getErrorMessage(e))
  }
  loading.value = false
}
fetchData()

watch(() => date.value, () => {
  fetchData()
})


const pageClickHandler = async (page: number) => {
  skip.value = page - 1
  await fetchData()
}

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_FOND
  }
})


</script>
<style lang="scss" scoped>
.base-select {
  &__label {
    font-size: 14px;
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }
}
</style>





















