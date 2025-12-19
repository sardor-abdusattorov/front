<template>
  <base-page-layout :title="t('tickets.event')" :isLoading="loading">
    <template #actions>
      <base-button to="/events/add" v-if="!userStore.isEmitent">{{ t('actions.create') }}</base-button>
    </template>
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row class="align-end">
            <v-col cols="12" md="3">
              <base-input
                v-model="filter.search"
                :label="t('tickets.eventName')"
                :placeholder="`${t('search')}...`"
                clearable
              ></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select
                :label="t('contract.status')"
                :placeholder="t('contract.status')"
                :items="statusList"
                v-model="filter.status"
                :item-title="'name'+capitalize(locale)"
              ></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table
        :key="eventListKey"
        :tableHeader="tableHeader"
        :table-body="events"
        :is-loading="loading"
        :menuList="menuList"
        @clickMenuHandler="handleMenuClick"
        @clickPreview="handlePreview"
        :pagination="{
          page: 0,
          total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchData()
          }
        }"
      ></base-table>
    </template>
  </base-page-layout>
  <agents-dialog
    v-if="dialog"
    v-model="dialog"
    :event-id="eventId"
    :isApproveFond="isApproveFond"
    @triggerLoadData="fetchData"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { getEventsAll, getEventStatusList, setEventStatusInProgress } from '@/services/events/events.service'
import { EventsDto } from '@/services/events/dto/events.dto'

import { PERMISSIONS } from '@/constants/permissions'
import { watch } from 'vue'
import router from '@/router'
import { toast } from 'vue3-toastify'
import { capitalize, getErrorMessage } from '@/utils/functions'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'
import { CompanyStructureListDto } from '@/services/organization/dto/organization.dto'

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS
  }
})




const { t, locale } = useI18n()
const loading = ref(false)
const dialog = ref(false)
const statusList = ref<CompanyStructureListDto[]>([])
const eventId = ref<number>(0)
const isApproveFond = ref<boolean>(false)
const eventListKey = ref(0)
const userStore = useUserStore()
const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('contract.action'),
    role: 'action',
    key: 'action',
    id: ''
  },
  {
    text: 'ID',
    role: 'text',
    key: 'id',
    id: ''
  },
  {
    text: t('events.event_name'),
    role: 'text',
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
    text: t('events.date_begin'),
    role: 'date',
    key: 'eventBegin',
    id: ''
  },
  {
    text: t('events.date_end'),
    role: 'date',
    key: 'eventEnd',
    id: ''
  },
  {
    text: t('events.price'),
    role: 'text',
    key: 'ticketPrice',
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

const menuList = ref<TableActionListType[]>([
  {
    id: 1,
    name: t('events.menu.send_fond'),
    isVisible: (row: EventsDto) => {
      return row.eventStatusId === STRUCTURES.FOND || row.eventStatusId === STRUCTURES.AGENT
    }
  },
  {
    id: 2,
    name: t('invite_agents'),
    isVisible: (row: EventsDto) => {
      return (
        !userStore.isEmitent && !userStore.isAgent && !userStore.isFond && row.eventStatusId === STRUCTURES.ORGANIZER
      )
    }
  },
  {
    id: 3,
    name: t('events.menu.view'),
    isVisible: true
  },
  {
    id: 4,
    name: t('events.menu.edit'),
    isVisible: !userStore.isEmitent
  },
  {
    id: 5,
    name: t('events.menu.tariffs'),
    isVisible: (row: EventsDto) => {
      return row.abonentTypeId === STRUCTURES.MUZEY
    }
  },
  {
    id: 6,
    name: t('events.menu.seans'),
    isVisible: (row: EventsDto) => {
      return (
        (userStore.isAgent || userStore.isTheatre || userStore.isOrganizer || userStore.isSuperUser) &&
        row.abonentTypeId !== STRUCTURES.MUZEY
      )
    }
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

const handleMenuClick = async (val: { nameId: number; id: number }) => {
  switch (val.nameId) {
    case 1:
      try {
        const { data } = await setEventStatusInProgress(val.id)
        if (data.result.success) {
          toast.success(t('contract.successfully'))
          fetchData()
        }
      } catch (err) {
        toast.error(getErrorMessage(err))
      }
      break
    case 2:
      eventId.value = val.id
      dialog.value = true
      isApproveFond.value = true
      break
    case 3:
      router.push({ name: '/events/view/[id]', params: { id: val.id.toString() } })
      break
    case 4:
      router.push({ name: '/events/edit/[id]', params: { id: val.id.toString() } })
      break
    case 5:
      router.push({ name: '/events/tariffs/[id]', params: { id: val.id.toString() } })
      break
    case 6:
      router.push({ name: '/events/sessions/[id]/', params: { id: val.id.toString() } })
      break
  }
}
const handlePreview = async (row: EventsDto) => {
  dialog.value = true
  eventId.value = row.id
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
    eventListKey.value++
    fetchData()
  },
  { deep: true }
)

watch([dialog], () => {
  if (!dialog.value) {
    eventId.value = 0
    isApproveFond.value = false
  }
})
onMounted(async () => {
  await Promise.all([fetchData(), statusListData()])
})
</script>
