<template>
  <base-page-layout :title="t('reports.reportByCountry')" :isLoading="loading">
    <template #actions>
      <base-button v-if="reportCountry.items.length > 0" prepend-icon="mdi-microsoft-excel" @click="downloadExcel">{{
        t('downExcel')
      }}</base-button>
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
              <base-select :items="countryList" item-value="id" :item-title="`name${capitalize(locale)}`"
                :multiple="true" v-model="filter.countryId" :label="t('report.reportsTicket.country')"
                :placeholder="t('report.reportsTicket.country')"></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <v-card>
        <CountryTable :country="reportCountry" :pagination="{
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
import { ReportRegionDto } from '@/services/report-region/dto/report-region.dto'
import { getCountryList, getExcelCountry, getReportCountry } from '@/services/report-region/report-region.service'
import dayjs from 'dayjs'
import { PERMISSIONS } from '@/constants/permissions'
import { capitalize, downloadBlobAsFile, getErrorMessage } from '@/utils/functions'
import { toast } from 'vue3-toastify'

const { t, locale } = useI18n()

const reportCountry = ref<ReportRegionDto>({
  museum: '',
  palace: '',
  from: '',
  to: '',
  items: [],
  count: 0
})
const loading = ref(false)

const countryList = ref([])

definePage({
  meta: {
    permission: PERMISSIONS.CASH
  }
})

const filter = ref<{ from: Date | null; to: Date | null; countryId: string[] }>({
  from: dayjs().startOf('day').toDate(),
  to: dayjs().endOf('day').toDate(),
  countryId: [] as string[]
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
    } = await getReportCountry({
      skip: currentPage.value,
      take: itemsPerPage.value,
      isAll: false,
      countryId: filter.value.countryId,
      from: dayjs(filter.value.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs(filter.value.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
    })

    totalNumber.value = result.count
    reportCountry.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const downloadExcel = async () => {
  loading.value = true
  try {
    const { data } = await getExcelCountry({
      countryId: filter.value.countryId,
      from: dayjs(filter.value.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs(filter.value.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
    })

    downloadBlobAsFile(data, 'Country.xlsx')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const getCountry = async () => {
  try {
    const {
      data: { result }
    } = await getCountryList()
    countryList.value = result
  } catch (e) {
    return { error: e }
  }
}

watch([filter], fetchData, { deep: true })

onMounted(async () => {
  await Promise.all([fetchData(), getCountry()])
})
</script>

<style scoped></style>
