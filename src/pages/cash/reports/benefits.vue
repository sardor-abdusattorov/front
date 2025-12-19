<template>
  <base-page-layout :title="t('reports.benefitsReports')" :is-loading="loading">
    <template #actions>
      <base-button v-if="reportTariff.eventGroups.length > 0" prepend-icon="mdi-microsoft-excel"
        @click="downloadExcel">{{ t('downExcel') }}</base-button>
    </template>
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row class="align-end">
            <v-col cols="12" md="4">
              <base-date-input multiple="range" v-model="dateValue" @update="updateDate($event)" :label="t('date')"
                :placeholder="t('date')"></base-date-input>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <v-card>
        <BenefitTable :benefits="reportTariff" :pagination="{
          page: currentPage,
          total: Math.ceil(totalNumber ? totalNumber / itemsPerPage : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchData()
          }
        }" />
      </v-card>
    </template>
  </base-page-layout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import { getReportBenefit, getExcelBenefits } from '@/services/report-benefit/report-benefit.service'
import { ReportBenefitDto } from '@/services/report-benefit/dto/report-benefit.dto'
import { PERMISSIONS } from '@/constants/permissions'
import { downloadBlobAsFile, getErrorMessage } from '@/utils/functions'
import { toast } from 'vue3-toastify'

const reportTariff = ref<ReportBenefitDto>({
  cashier: '',
  count: 0,
  eventGroups: [],
  from: '',
  museum: '',
  palace: '',
  to: ''
})
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const totalNumber = ref<number | undefined>(0)
const loading = ref(false)

const { t } = useI18n()

definePage({
  meta: {
    permission: PERMISSIONS.CASH
  }
})

const filter = ref({
  from: dayjs().startOf('day').toDate(),
  to: dayjs().endOf('day').toDate(),
  palaceId: null
})

const dateValue = ref([filter.value.from, filter.value.to])

const updateDate = (data: { from: Date; to: Date }) => {
  if (dayjs(data.from).isSame(data.to, 'day')) {
    filter.value.from = data.from
    filter.value.to = data.to
  }
  else {
    filter.value.from = dayjs(data.from).startOf('day').toDate()
    filter.value.to = dayjs(data.to).add(-1, 'day').endOf('day').toDate()
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getReportBenefit({
      skip: currentPage.value,
      take: itemsPerPage.value,
      palaceId: filter.value.palaceId,
      from: dayjs(filter.value.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs(filter.value.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      isAll: false
    })

    totalNumber.value = data.count
    reportTariff.value = data
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const downloadExcel = async () => {
  loading.value = true
  try {
    const { data } = await getExcelBenefits({
      ...filter.value, from: dayjs(filter.value.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs(filter.value.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss'), isAll: true
    })
    downloadBlobAsFile(data, 'Benefits.xlsx')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch([filter], fetchData, { deep: true })

fetchData()
</script>

<style scoped></style>
