<template>
  <base-page-layout :title="t('reports.reportByRegion')" :isLoading="loading">
    <template #actions>
      <base-button prepend-icon="mdi-microsoft-excel" @click="downloadExcel" v-if="reportRegion.items.length > 0">{{
        t('downExcel')
      }}</base-button>
    </template>
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row class="align-end">
            <v-col cols="12" md="4">
              <base-date-input v-model="dateValue" @update="updateDate($event)" multiple="range" :label="t('date')"
                :placeholder="t('date')">
              </base-date-input>
            </v-col>
            <v-col cols="12" md="4">
              <base-select :items="palaceList" v-model="filter.palaceId" :label="t('report.reportsTicket.institution')"
                :placeholder="t('report.reportsTicket.institution')"></base-select>
            </v-col>
            <v-col cols="12" md="4">
              <base-select :items="regionList" item-value="id" :item-title="'name' + capitalize(locale)"
                :multiple="true" v-model="filter.regionId" :label="t('report.reportsTicket.region')"
                :placeholder="t('report.reportsTicket.region')"></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <v-card>
        <RegionTable :regions="reportRegion" :pagination="{
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
import { ReportRegionDto } from '@/services/report-region/dto/report-region.dto'
import {
  getExcelRegion,
  getRegionList,
  getRegionPalaceList,
  getReportRegion
} from '@/services/report-region/report-region.service'
import dayjs from 'dayjs'
import { PERMISSIONS } from '@/constants/permissions'
import { capitalize, downloadBlobAsFile, getErrorMessage } from '@/utils/functions'
import { toast } from 'vue3-toastify'

const { t, locale } = useI18n()

const reportRegion = ref<ReportRegionDto>({
  museum: '',
  palace: '',
  from: '',
  to: '',
  items: [],
  count: 0
})
const loading = ref(false)

const palaceList = ref([])
const regionList = ref([])

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_MUSEIUM
  }
})

const filter = ref<{ from: Date | null; to: Date | null; palaceId: null | string; regionId: string[] }>({
  from: dayjs().startOf('day').toDate(),
  to: dayjs().endOf('day').toDate(),
  palaceId: null,
  regionId: [] as string[]
})

const dateValue = ref([filter.value.from, filter.value.to])

const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)

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
    const {
      data: { result }
    } = await getReportRegion({
      skip: currentPage.value,
      take: itemsPerPage.value,
      isAll: false,
      from: dayjs(filter.value.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs(filter.value.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      palaceId: filter.value.palaceId,
      regionId: filter.value.regionId
    })

    totalNumber.value = result.count
    reportRegion.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const downloadExcel = async () => {
  loading.value = true
  try {
    const { data } = await getExcelRegion({
      regionId: filter.value.regionId,
      from: dayjs(filter.value.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs(filter.value.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      palaceId: filter.value.palaceId,
      isAll: true,
    })

    downloadBlobAsFile(data, 'Region.xlsx')
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const getPalaceList = async () => {
  try {
    const {
      data: { result }
    } = await getRegionPalaceList()
    palaceList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const getRegion = async () => {
  try {
    const {
      data: { result }
    } = await getRegionList()
    regionList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

watch([filter], fetchData, { deep: true })
onMounted(async () => {
  await Promise.all([fetchData(), getPalaceList(), getRegion()])
})
</script>
