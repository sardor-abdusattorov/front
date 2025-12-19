<template>
  <base-page-layout :title="t('tickets.event')" :isLoading="loading">
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row class="align-end">
            <v-col cols="12" md="3">
              <base-input v-model="filter.search" :label="t('tickets.eventName')" :placeholder="`${t('search')}...`"
                clearable @update:model-value="searchByName"></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select class="select" v-model="filter.structureId" :placeholder="t('subscriberType')"
                :items="structureList" :item-title="`name${capitalize(locale)}`" item-value="value" />
            </v-col>
            <v-col cols="12" md="3" v-if="filter.structureId">
              <base-select class="select" v-model="filter.orgId" :placeholder="t('user.organizer')" :items="companyList"
                item-title="text" item-value="value" />
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table :key="key" :tableHeader="tableHeader" :table-body="events" :is-loading="loading" :menuList="menuList"
        @clickMenuHandler="handleMenuClick" @clickPreview="handlePreview" :pagination="{
          page: 0,
          total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchData()
          }
        }">
        <template v-slot:btnAction="{ row }">
          <div class="d-flex align-center">
            <base-button v-if="row.requestStatusId === null" @click="sendRequest(row.eventId)" style="font-size: 12px"
              class="text-capitalize rounded-xl">{{ t('submitApplication') }}</base-button>
            <base-button size="small" v-else-if="row.requestStatusId === 2" color="orange" style="font-size: 10px">
              {{ t('applicationSent') }}
            </base-button>
            <div v-else-if="row.requestStatusId === 4" class="d-flex align-center ga-2">
              <base-button size="small" color="red" style="font-size: 10px">{{ t('applicationRejected') }}</base-button>
              <v-btn @click="sendRequest(row.eventId)" density="compact" icon="mdi-reload" class="text-white"
                color="orange"></v-btn>
            </div>
            <base-button size="small" v-else-if="row.requestStatusId === 3" color="green" style="font-size: 10px">
              {{ t('requestApproved') }}
            </base-button>
          </div>
        </template>
      </base-table>
    </template>
  </base-page-layout>
  <agents-dialog v-if="dialog" v-model="dialog" :event-id="eventId" :isApproveFond="isApproveFond"
    @triggerLoadData="fetchData" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { getEventStatusList, setEventStatusInProgress } from '@/services/events/events.service'
import { EventsDto } from '@/services/events/dto/events.dto'

import { PERMISSIONS } from '@/constants/permissions'
import { watch } from 'vue'
import router from '@/router'
import { toast } from 'vue3-toastify'
import { capitalize, debounce, getErrorMessage } from '@/utils/functions'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'
import { CompanyStructureListDto } from '@/services/organization/dto/organization.dto'
import { getAllAgentEvents, sendRequestFromEvent } from '@/services/agent/agent.service'
import { GetAgentEventsList } from '@/services/agent/model/agent.model'
import { getCompanyListByStructureId, getStructureList } from '@/services/organization/organization.service'

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS_ALL_AGENT
  }
})

const { t, locale } = useI18n()
const loading = ref(false)
const dialog = ref(false)
const statusList = ref<CompanyStructureListDto[]>([])
const eventId = ref<number>(0)
const isApproveFond = ref<boolean>(false)
const key = ref(0)
const structureList = ref()
const companyList = ref()

const userStore = useUserStore()

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('contract.action'),
    role: 'btnAction',
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
    text: t('user.organizer'),
    role: 'text',
    key: 'orgName',
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
    role: 'text',
    key: `abonentTypeName${capitalize(locale.value)}`,
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

const getStructureListAbonent = async () => {
  try {
    const {
      data: { result }
    } = await getStructureList()
    structureList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getCompanyListByStructure = async (structureId: number) => {
  try {
    const {
      data: { result }
    } = await getCompanyListByStructureId({ structureId })
    companyList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

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
  search: '',
  structureId: null,
  orgId: null
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

const sendRequest = async (eventId: number) => {
  try {
    const { data } = await sendRequestFromEvent({ eventId })
    if (data.result.success) {
      toast.success(t('contract.successfully'))
      await fetchData()
    }
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getAllAgentEvents({
      skip: currentPage.value,
      take: itemsPerPage.value,
      eventName: filter.value.search,
      abonentTypeId: filter.value.structureId,
      orgId: filter.value.orgId,
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
  currentPage.value = 0
  key.value++
  await fetchData()
}, 300)

watch(
  () => filter.value.structureId,
  async () => {
    filter.value.orgId = null
    await fetchData()
    if (filter.value.structureId)
      getCompanyListByStructure(filter.value.structureId)
  }
)

watch(() => filter.value.orgId, async () => {
  await fetchData()
})

watch([dialog], () => {
  if (!dialog.value) {
    eventId.value = 0
    isApproveFond.value = false
  }
})

onMounted(async () => {
  await Promise.all([fetchData(), getStructureListAbonent(), statusListData()])
})
</script>
