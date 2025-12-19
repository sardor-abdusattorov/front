<template>
  <base-page-layout :title="t('tickets.event')" :isLoading="loading">
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
                @update:model-value="searchByName"
              ></base-input>
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
      >
        <template v-slot:action="{ row }">
          <base-button @click="viewEvent(row.eventId)" class="text-capitalize">{{ t('actions.view') }}</base-button>
        </template>
      </base-table>
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
import { getEventStatusList, setEventStatusInProgress } from '@/services/events/events.service'
import { EventsDto } from '@/services/events/dto/events.dto'

import { PERMISSIONS } from '@/constants/permissions'
import router from '@/router'
import { toast } from 'vue3-toastify'
import { debounce, getErrorMessage } from '@/utils/functions'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'
import { CompanyStructureListDto } from '@/services/organization/dto/organization.dto'
import { getAgentEvents } from '@/services/agent/agent.service'
import { GetAgentEventsList } from '@/services/agent/model/agent.model'

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS_MY_AGENT
  }
})

const { t } = useI18n()
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
    isVisible: false,
    id: ''
  },
  {
    text: 'ID',
    role: 'text',
    key: 'eventId',
    id: ''
  },
  {
    text: t('events.event_name'),
    role: 'text',
    key: 'eventName',
    id: ''
  },
  {
    text: t('events.date_begin'),
    role: 'dataTime',
    key: 'beginDate',
    id: ''
  },
  {
    text: t('events.date_end'),
    role: 'dataTime',
    key: 'endDate',
    id: ''
  },
  {
    text: t('subscriberType'),
    role: 'langText',
    key: 'abonentTypeName',
    id: ''
  },
  {
    text: t('events.palace'),
    role: 'text',
    key: 'palaceName',
    id: ''
  },
  {
    text: t('establishmentHall'),
    role: 'text',
    key: 'palaceHallName',
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
    isVisible: userStore.isMuseum
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
  search: ''
})

const events = ref<GetAgentEventsList[]>([])
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

const viewEvent = (eventId: number) => {
  router.push({ name: '/events/view/[id]', params: { id: eventId.toString() } })
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getAgentEvents({
      skip: currentPage.value,
      take: itemsPerPage.value,
      searchText: filter.value.search
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

const searchByName = debounce(async () => {
  eventListKey.value++
  currentPage.value = 0
  await fetchData()
}, 300)

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
