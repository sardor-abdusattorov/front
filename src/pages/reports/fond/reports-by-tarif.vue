<template>
  <base-page-layout :title="t('reports.tariffReport')" :isLoading="loading">
    <template #actions>
      <base-button prepend-icon="mdi-microsoft-excel" @click="downloadExcel"
        v-if="reportTariff.eventGroups.length > 0">{{ t('downExcel') }}</base-button>
    </template>
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row class="align-end">
            <v-col cols="12" md="4">
              <base-date-input multiple="range" v-model="dateValue" @update="udpateDate" :label="t('date')"
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
        <tarif-table :tariffs="reportTariff" :paymentTypes="paymentTypes" :agents="agents" :totals="totals" :pagination="{
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
import { toast } from 'vue3-toastify'

import { getExcelTariff, getReportTariff } from '@/services/report-tariff/report-tariff.service'
import { PERMISSIONS } from '@/constants/permissions'
import { downloadBlobAsFile, getErrorMessage } from '@/utils/functions'

import {
  ReportTariffDto,
  PaymentType,
  Tariff,
  EventGroup,
  TotalsType
} from '@/services/report-tariff/dto/report-tariff.dto'
import dayjs from 'dayjs'
import { getRegionPalaceListByOrgId } from '@/services/report-region/report-region.service'
import { getOrganizations } from '@/services/contracts/contracts.service'
import { STRUCTURES } from '@/constants/structures'

const reportTariff = ref<ReportTariffDto>({
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
const organizationList = ref([])
const palaceList = ref([])

const { t } = useI18n()

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_FOND
  }
})

const filter = ref<{ from: Date | null; to: Date | null; palaceId: number | null; orgId: null | number }>({
  from: dayjs().startOf('day').toDate(),
  to: dayjs().endOf('day').toDate(),
  palaceId: null,
  orgId: null
})

const dateValue = ref([filter.value.from, filter.value.to])
const paymentTypes = ref<PaymentType[]>([])
const agents = ref<PaymentType[]>([])

const totals = ref<TotalsType>({
  sum: 0,
  quantity: 0,
  agentSum: 0
})

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
    const {
      data: { result }
    } = await getReportTariff({
      skip: currentPage.value,
      take: itemsPerPage.value,
      palaceId: filter.value.palaceId,
      from: dayjs(filter.value.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs(filter.value.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      orgId: filter.value.orgId
    })

    totals.value = {
      sum: 0,
      quantity: 0,
      agentSum: 0
    }

    totalNumber.value = result.count
    reportTariff.value = result
    getCollection(reportTariff.value.eventGroups, 'paymentTypes', paymentTypes.value)
    getCollection(reportTariff.value.eventGroups, 'agents', agents.value)
    getTotals(reportTariff.value.eventGroups)
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

const getTotals = (arr: EventGroup[]) => {
  if (!arr || arr.length === 0) return arr

  reportTariff.value.eventGroups = arr.map((eventGroup: EventGroup) => {
    let total: { [key: string]: any; sum: number; quantity: number } = {
      sum: 0,
      quantity: 0
    }

    eventGroup.tariffs.forEach((tariff: Tariff) => {
      tariff.paymentTypes.forEach((paymentType: PaymentType) => {
        if (!total[paymentType.name]) {
          total[paymentType.name] = { quantity: 0, sum: 0 }
        }
        total[paymentType.name].quantity += paymentType.quantity
        total[paymentType.name].sum += paymentType.sum

        if (!totals.value[paymentType.name]) {
          totals.value[paymentType.name] = { quantity: 0, sum: 0 }
        }
        totals.value[paymentType.name].quantity += paymentType.quantity
        totals.value[paymentType.name].sum += paymentType.sum
      })

      tariff.agents.forEach((paymentType: PaymentType) => {
        if (!total[paymentType.name]) {
          total[paymentType.name] = { quantity: 0, sum: 0, agentSum: 0 }
        }
        total[paymentType.name].quantity += paymentType.quantity
        total[paymentType.name].sum += paymentType.sum
        total[paymentType.name].agentSum! += paymentType.agentSum!

        if (!totals.value[paymentType.name]) {
          totals.value[paymentType.name] = { quantity: 0, sum: 0, agentSum: 0 }
        }
        totals.value[paymentType.name].quantity += paymentType.quantity
        totals.value[paymentType.name].sum += paymentType.sum
        totals.value[paymentType.name].agentSum! += paymentType.agentSum!
      })

      total.sum += tariff.total.sum
      total.quantity += tariff.total.quantity
    })

    totals.value.sum += total.sum
    totals.value.quantity += total.quantity

    return {
      ...eventGroup,
      total
    }
  })
}

const getCollection = (arr: any[], key: string, collection: any[]) => {
  if (!Array.isArray(arr)) return

  arr.forEach((items: any) => {
    items.tariffs.forEach((it: any) => {
      if (!it[key]) return
      it[key].forEach((item: any) => {
        const i = collection.findIndex((x: any) => x.id === item.id)
        if (i === -1) collection.push({ name: item.name, id: item.id })
      })
    })
  })
}

const downloadExcel = async () => {
  loading.value = true
  try {
    const { data } = await getExcelTariff({
      from: dayjs(filter.value.from).startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      to: dayjs(filter.value.to).endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
      palaceId: filter.value.palaceId,
      orgId: filter.value.orgId,
      isAll: true,
    })
    downloadBlobAsFile(data, 'Tariff.xlsx')
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const udpateDate = (data: { from: Date; to: Date }) => {
  if (dayjs(data.from).isSame(data.to, 'day')) {
    filter.value.from = data.from
    filter.value.to = data.to
  }
  else {
    filter.value.from = dayjs(data.from).startOf('day').toDate()
    filter.value.to = dayjs(data.to).add(-1, 'day').endOf('day').toDate()
  }
}

watch(
  [filter],
  async () => {
    paymentTypes.value = []
    agents.value = []
    await fetchData()
  },
  { deep: true }
)
onMounted(async () => {
  await Promise.all([fetchData(), fetchOrganizations()])
})
</script>
