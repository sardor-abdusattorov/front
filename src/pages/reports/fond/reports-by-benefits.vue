<template>
  <base-page-layout :title="t('reports.benefitsReports')" :is-loading="loading">
    <template #actions>
      <base-button v-if="reportBenefit.eventGroups.length > 0" prepend-icon="mdi-microsoft-excel"
        @click="downloadExcel">{{ t('downExcel') }}</base-button>
    </template>
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row class="align-end">
            <v-col cols="12" md="4">
              <base-date-input v-model="dateValue" @update="updateDate($event)" multiple="range" :label="t('date')"
                :placeholder="t('date')"></base-date-input>
            </v-col>
            <v-col cols="12" md="4">
              <base-select :items="organizationList" v-model="filter.orgId" :label="t('contract.organization')"
                :placeholder="t('contract.organization')" item-title="name" item-value="id"
                @update:model-value="getPalaceList" @click:clear="clearOrgHandler"></base-select>
            </v-col>
            <v-col cols="12" md="4">
              <base-select :items="palaceList" :disabled="!filter.orgId" v-model="filter.palaceId"
                :placeholder="t('report.reportsTicket.institution')" :label="t('report.reportsTicket.institution')"
                item-title="name" item-value="id"></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <v-card>
        <BenefitTable :benefits="reportBenefit" :pagination="{
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
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

import { PERMISSIONS } from '@/constants/permissions'
import { STRUCTURES } from '@/constants/structures'
import { downloadBlobAsFile, getErrorMessage } from '@/utils/functions'

import { getExcelBenefits, getReportBenefit } from '@/services/report-benefit/report-benefit.service'
import { getRegionPalaceListByOrgId } from '@/services/report-region/report-region.service'
import { getOrganizations } from '@/services/contracts/contracts.service'

import { ReportBenefitDto } from '@/services/report-benefit/dto/report-benefit.dto'

const reportBenefit = ref<ReportBenefitDto>({
  cashier: '',
  count: 0,
  eventGroups: [],
  from: '',
  museum: '',
  palace: '',
  to: ''
})
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)

const loading = ref(false)

const { t } = useI18n()

const palaceList = ref([])
const organizationList = ref([])

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_FOND
  }
})

const filter = ref({
  from: dayjs().startOf('day').toDate(),
  to: dayjs().endOf('day').toDate(),
  palaceId: null,
  orgId: null
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

const clearOrgHandler = () => {
  filter.value.palaceId = null
  palaceList.value = []
}
const fetchOrganizations = async () => {
  try {
    const { data } = await getOrganizations(STRUCTURES.MUZEY)
    organizationList.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getReportBenefit({
      skip: currentPage.value,
      take: itemsPerPage.value,
      isAll: false,
      palaceId: filter.value.palaceId,
      from: dayjs(filter.value.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs(filter.value.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      orgId: filter.value.orgId
    })

    totalNumber.value = data.count
    reportBenefit.value = data
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const getPalaceList = async () => {
  if (!filter.value.orgId) return
  palaceList.value = []
  filter.value.palaceId = null
  try {
    const {
      data: { result }
    } = await getRegionPalaceListByOrgId(filter.value.orgId)
    palaceList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
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
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

watch([filter], fetchData, { deep: true })

onMounted(async () => {
  await Promise.all([fetchData(), fetchOrganizations()])
})
</script>
