<template>
  <base-page-layout :title="t('tickets.event')" :isLoading="loading">
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row class="align-end">
            <v-col cols="12" md="3">
              <base-input v-model="filter.search" :label="t('tickets.eventName')" :placeholder="`${t('search')}...`"
                clearable></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select :label="t('contract.status')" :placeholder="t('contract.status')" :items="statusList"
                :item-title="'name' + capitalize(locale)" v-model="filter.status"></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table :key="eventListKey" :tableHeader="tableHeader" :table-body="events" :is-loading="loading"
        @clickPreview="handlePreview" :pagination="{
          page: 0,
          total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchData()
          }
        }"></base-table>
    </template>
  </base-page-layout>
  <agents-dialog v-if="dialog" v-model="dialog" :event-id="eventId" :isApproveFond="isApproveFond"
    @triggerLoadData="fetchData" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { capitalize, getErrorMessage } from '@/utils/functions'
import { PERMISSIONS } from '@/constants/permissions'

import { getEventsAll, getEventStatusList } from '@/services/events/events.service'

import type { TableHeaderTypes } from '@/types/table.types'
import { EventsDto } from '@/services/events/dto/events.dto'
import { CompanyStructureListDto } from '@/services/organization/dto/organization.dto'

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS_FOND
  }
})

const { t, locale } = useI18n()
const eventListKey = ref(0)
const router = useRouter()
const loading = ref(false)
const dialog = ref(false)
const statusList = ref<CompanyStructureListDto[]>([])
const eventId = ref<number>(0)
const isApproveFond = ref<boolean>(false)

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: 'ID',
    role: 'text',
    key: 'id',
    id: ''
  },
  {
    text: t('establishments'),
    role: 'text',
    key: 'orgName',
    id: ''
  },
  {
    text: t('user.organizer'),
    role: 'text',
    key: 'organizator',
    id: ''
  },
  {
    text: t('events.event_name'),
    role: 'preview',
    key: 'name',
    id: ''
  },
  {
    text: t('events.who_created'),
    role: 'text',
    key: 'creator',
    id: ''
  },
  {
    text: t('events.palace'),
    role: 'text',
    key: 'palaceName',
    id: ''
  },

  {
    text: t('events.agents'),
    role: 'preview',
    key: '',
    id: ''
  },
  {
    text: t('events.status'),
    role: 'statusLangText',
    key: 'eventStatusName',
    id: 'eventStatusId'
  },
  {
    text: t('events.reason_reject'),
    role: 'text',
    key: 'rejectReason',
    id: ''
  }
])

const filter = ref({
  status: null,
  search: null,
  date: null
})

const events = ref<EventsDto[]>([])
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)

const handlePreview = async (row: EventsDto, key: string) => {
  if (!key) {
    dialog.value = true
    eventId.value = row.id
  } else {
    router.push({ name: '/events/view/[id]', params: { id: row.id.toString() } })
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getEventsAll({
      skip: currentPage.value,
      take: itemsPerPage.value,
      searchText: filter.value.search,
      status: filter.value.status
    })
    totalNumber.value = total
    events.value = data
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}
const statusListData = async () => {
  try {
    const {
      data: { result }
    } = await getEventStatusList()
    statusList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
watch(
  [filter],
  () => {
    currentPage.value = 0
    fetchData()
  },
  { deep: true }
)

watch([dialog], () => {
  if (!dialog.value) {
    eventId.value = 0
    eventListKey.value++
    isApproveFond.value = false
  }
})
onMounted(async () => {
  await Promise.all([fetchData(), statusListData()])
})
</script>
