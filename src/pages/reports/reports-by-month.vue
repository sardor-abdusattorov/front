<template>
  <base-page-layout :title="t('reports.reportByMonth')" :isLoading="loading">
    <template #filter>
      <v-card class="pa-4">
        <v-row>
          <v-col cols="12" md="3">
            <base-select
              :items="years"
              item-value="value"
              item-title="name"
              v-model="filter.year"
              :label="t('year')"
            />
          </v-col>
          <v-col cols="12" md="3">
            <base-select
              :items="months"
              item-value="value"
              item-title="name"
              v-model="filter.month"
              :label="t('month')"
            />
          </v-col>
          <v-col cols="12" md="3">
            <base-select
              v-if="companies?.length > 0 && !store.isTheatre && !store.isOrganizer"
              :items="companies"
              item-value="value"
              item-title="text"
              v-model="filter.orgId"
              :label="t('contract.organization')"
            />
          </v-col>
          <v-col cols="12" md="3">
            <base-select
              multiple
              v-if="events?.length > 0"
              :items="events"
              item-value="value"
              item-title="text"
              v-model="filter.eventIdList"
              :label="t('tickets.event')"
            />
          </v-col>
          <v-col cols="12" md="12" class="d-flex justify-end align-end">
            <base-button @click="downloadExcel" v-if="tableData.length > 0" prepend-icon="mdi-microsoft-excel">
              {{ t('downExcel') }}
            </base-button>
          </v-col>
        </v-row>
      </v-card>
    </template>
    <template #content>
      <ReportTable :table-data="tableData" :agent-list-header="agentListHeader" :skip="filter.skip" :take="filter.take"
                   :total="total" @fetch="pageClickHandler($event)" />
      <base-empty class="empty" v-if="tableData.length === 0 && !loading" />
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { PERMISSIONS } from '@/constants/permissions'
import { getMonths, getYears } from '@/constants/getDates'
import { downloadBlobAsFile, getErrorMessage } from '@/utils/functions'

import { getReportByMonth, getReportByMonthExel } from '@/services/report-by-month'
import { getAllEventListByDate, getCompanyAllList } from '@/services/organization/organization.service'

import type { ReportByMonthDto } from '@/services/report-by-month/dto'
import type { AgentListHeader, ReportsByMonthModel } from '@/services/report-by-month/model'
import { useUserStore } from '@/stores/user.store'
import { userInfo } from 'os'

const { t } = useI18n()

const months = ref(getMonths())
const years = ref(getYears())
const companies = ref<any[]>([])
const events = ref<any[]>([])
const agentListHeader = ref<AgentListHeader[]>([])
const tableData = ref<ReportsByMonthModel[][]>([])
const total = ref(0)
const loading = ref(false)
const store = useUserStore()

const filter = ref<ReportByMonthDto>({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  byMonth: true,
  skip: 0,
  take: 10,
  startDate: '',
  endDate: '',
  orgId: '',
  eventIdList: []
})


definePage({
  meta: {
    permission: PERMISSIONS.REPORTS,
  }
})

const getCompanies = async () => {
  try {
    const { data } = await getCompanyAllList()
    companies.value = data.result
  } catch (err) {
    toast.error(getErrorMessage(err))
  }
}

const fetchReportsByMonth = async () => {
  try {
    loading.value = true
    const { data } = await getReportByMonth({
      ...filter.value,
      startDate: structureDate('01'),
      endDate: structureDate(getLastDayOfMonth())
    })
    tableData.value = data.result.data.item1
    total.value = data.result.total
    agentListHeader.value = data.result.data.item2
  } catch (err) {
    toast.error(getErrorMessage(err))
  } finally {
    loading.value = false
  }
}

const downloadExcel = async () => {
  try {
    const { data } = await getReportByMonthExel({
      ...filter.value,
      startDate: structureDate('01'),
      endDate: structureDate(getLastDayOfMonth())
    })
    downloadBlobAsFile(data, 'ReportsByMonth.xlsx')
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getEventList = async () => {
  try {
    const { data } = await getAllEventListByDate({
      OrgId: filter.value.orgId,
      startDate: structureDate('01'),
      endDate: structureDate(getLastDayOfMonth())
    })
    events.value = data.result
    if (!events.value.length) {
      toast.warning(t('directory.organizationNotHaveEvent'))
    } else {
      await fetchReportsByMonth()
    }
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const structureDate = (day: string) => {
  const month = filter.value.month! < 10 ? `0${filter.value.month}` : filter.value.month
  return `${day}.${month}.${filter.value.year}`
}

const getLastDayOfMonth = () => {
  const year = filter.value.year;
  const month = filter.value.month;
  return new Date(year, month, 0).getDate().toString(); 
};

const pageClickHandler = (page: number) => {
  filter.value.skip = page - 1
  fetchReportsByMonth()
}

getCompanies()



// if (store.isOrganizer || store.isTheatre || store.isFond) {
//   filter.value.orgId = store.organizationId
// }


watch(() => filter.value.orgId, () => {
  filter.value.eventIdList = []
  tableData.value = []
})
watch(() => filter.value.month, () => {
  filter.value.eventIdList = []
  tableData.value = []
})
watch(() => filter.value.year, () => {
  filter.value.eventIdList = []
  tableData.value = []
})

watch(
  [filter],
  () => {
   if (store.isTheatre || store.isOrganizer){
      if (!filter.value.month || !filter.value.year) {
        return
      }
      fetchReportsByMonth()
    } else {
      if (!filter.value.month || !filter.value.year || !filter.value.orgId) {
        return
      }
      getEventList()
    }
  },
  { immediate: true, deep: true }
)
</script>
