<template>
  <base-page-layout :title="t('ticketsName')" :isLoading="loading">
    <template #filter>
      <v-card class="pa-4">
        <v-row>
          <v-col cols="12" md="3">
            <base-date-input v-model="filter.from" :placeholder="t('from')" />
          </v-col>
          <v-col cols="12" md="3">
            <base-date-input v-model="filter.to" :placeholder="t('to')" />
          </v-col>
        </v-row>
      </v-card>
    </template>
    <template #content>
      <base-table
        :key="ticketsListKey"
        :table-header="tableHeader"
        :table-body="ticketsList"
        :is-loading="loading"
        :pagination="{
          page: pagination.page,
          total: Math.ceil(pagination.total / pagination.perPage),
          pageClickHandler: (page: number) => {
            pagination.page = page - 1
            fetchBlockchainTickets()
          }
        }"
      ></base-table>
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'
import { BlockchainModel } from '@/services/ticket/model/ticker.model'
import { getBlockchainTickets } from '@/services/ticket/ticket.service'
import { TableHeaderTypes } from '@/types/table.types'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const { t } = useI18n()
const ticketsList = ref<BlockchainModel[]>([])

const filter = ref({
  from: null,
  to: null
})

const pagination = ref({
  page: 0,
  total: 0,
  perPage: 10
})

const loading = ref(false)
const ticketsListKey = ref(0)
const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: '№',
    role: 'index',
    key: 'id',
    id: 1
  },
  {
    text: t('report.reportsTicket.ticketNumber'),
    role: 'text',
    key: 'ticketNumber',
    id: 2
  },
  {
    text: t('events.agent_modal.agent'),
    role: 'text',
    key: 'agentName',
    id: 3
  },
  {
    text: t('eventOwner'),
    role: 'text',
    key: 'orgName1',
    id: 4
  },
  {
    text: t('contract.conculisionDate'),
    role: 'date-time',
    key: 'createDate',
    id: 5
  },
  {
    text: t('event'),
    role: 'text',
    key: 'eventName',
    id: 6
  },
  {
    text: t('key'),
    role: 'text',
    key: 'blockHash',
    id: 7
  },
  {
    text: t('prevKey'),
    role: 'text',
    key: 'transactionHash',
    id: 8
  }
])

const fetchBlockchainTickets = async () => {
  try {
    loading.value = true
    const { data } = await getBlockchainTickets({
      skip: pagination.value.page,
      take: pagination.value.perPage,
      ...filter.value
    })
    ticketsList.value = data.result.data
    pagination.value.total = data.result.total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

definePage({
  meta: {
    permission: PERMISSIONS.BLOCKCHAIN
  }
})

watch(
  filter,
  () => {
    ticketsListKey.value++
    pagination.value.page = 0
    fetchBlockchainTickets()
  },
  { deep: true }
)

fetchBlockchainTickets()
</script>
