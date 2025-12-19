<template>
  <div class="d-flex flex-column">
    <base-page-layout :title="t('sessions.title')" :back="true" :isLoading="loading" :remove-height="true">
      <template #actions>
        <base-button :to="`/events/sessions/${route.params.id}/add`">{{ t('sessions.add_session') }}</base-button>
      </template>
      <template #content>
        <base-table :tableHeader="tableHeader" :tableBody="sessionsList" :is-loading="loading" :menuList="menuList"
          :activeTableId="activeTableId" :pagination="{
            page: 0,
            total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
            width: width > 1200 ? '70%' : '100vw',
            pageClickHandler: (page: number) => {
              currentPage = page - 1
              fetchAllSessions()
            }
          }" @click-menu-handler="handleClickMenu">
        </base-table>
      </template>
    </base-page-layout>
    <div class="mt-4" v-if="isTarifOpen">
      <tariffs-table :back="false" :sessionId="sessionId">
        <template #actions>
          <base-button @click="isSchemeOpen = true">{{ t('open_scheme') }}</base-button>
        </template>
      </tariffs-table>
      <div v-if="isSchemeOpen">
        <session-scheme-dialog v-model="isSchemeOpen" :sessionName="sessionName" :sessionId="sessionId!" />
      </div>
    </div>
    <session-event-dialog v-model="isDialogOpen" :eventSessionVal="eventSessionVal!" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { getErrorMessage, sleep } from '@/utils/functions'

import { getAllEventId, getEventSessionVal, toggleEventIsActive } from '@/services/tarif/tarif.service'
import { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { EventListModel, TarifEventModel } from '@/services/tarif/model/tarif.model'
import { useDisplay } from 'vuetify'

const { width } = useDisplay()

const { t } = useI18n()
const route: any = useRoute()
const router = useRouter()

const sessionsList = ref<TarifEventModel[]>([])
const eventSessionVal = ref<EventListModel>()

const loading = ref(false)
const totalNumber = ref(0)
const currentPage = ref(0)
const isTarifOpen = ref(false)
const activeTableId = ref<number | undefined>(undefined)
const sessionId = ref<number | undefined>(undefined)
const isDialogOpen = ref(false)
const isSchemeOpen = ref(false)
const sessionName = ref('')

const tableHeader = ref<TableHeaderTypes[]>([
  {
    id: 7,
    text: t('tariffs.table.action'),
    role: 'action',
    key: 'action'
  },
  {
    id: 1,
    text: t('contract.id'),
    role: 'text',
    key: 'id'
  },
  {
    id: 2,
    text: t('halls.name'),
    role: 'text',
    key: 'name'
  },
  {
    id: 3,
    text: t('beginDate'),
    role: 'date-time',
    key: 'eventBegin'
  },
  {
    id: 4,
    text: t('endDate'),
    role: 'date-time',
    key: 'eventEnd'
  },
  {
    id: 5,
    text: t('active'),
    role: 'checkbox',
    key: 'active'
  },
  {
    id: 6,
    text: t('events.menu.tariffs'),
    role: 'text',
    key: 'tarifCount'
  }
])

const menuList = ref<TableActionListType[]>([
  { id: 1, name: t('tariffs.menu.edit') },
  { id: 2, name: t('events.menu.tariffs') },
  { id: 3, name: t('deactivate'), isVisible: (row: TarifEventModel) => row.active },
  { id: 4, name: t('activate'), isVisible: (row: TarifEventModel) => !row.active },
  { id: 5, name: t('total_sum') }
])

const fetchAllSessions = async () => {
  try {
    loading.value = true
    const { data } = await getAllEventId({ eventId: +route.params.id, skip: currentPage.value, take: 10 })
    sessionsList.value = data.result.data
    totalNumber.value = data.result.total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const activeHandler = async (sessionId: number, isActive: boolean) => {
  try {
    const { data } = await toggleEventIsActive({ sessionId, isActive })
    if (data.result.success) {
      !isActive ? toast.success(t('deactivate_success')) : toast.success(t('activate_success'))
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    fetchAllSessions()
  }
}

const fetchEventListVal = async (id: number) => {
  try {
    const { data } = await getEventSessionVal(id)
    eventSessionVal.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const handleClickMenu = async (value: { id: number; nameId: number }) => {
  switch (value.nameId) {
    case 1:
      router.push(`/events/sessions/${route.params.id}/edit?sessionId=${value.id}`)
      break
    case 2:
      isTarifOpen.value = false
      await sleep(0)
      isTarifOpen.value = true
      sessionId.value = value.id
      activeTableId.value = value.id
      sessionName.value = sessionsList.value.find((el) => el.id === value.id)?.name || ''
      break
    case 3:
      activeHandler(value.id, false)
      break
    case 4:
      activeHandler(value.id, true)
      break
    case 5:
      isDialogOpen.value = true
      fetchEventListVal(value.id)
      break
  }
}

fetchAllSessions()
</script>
