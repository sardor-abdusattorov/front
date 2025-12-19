<template>
  <base-page-layout :title="t('tickets.applicationsForParticipationInEvents')" :isLoading="loading">
    <template #filter>
      <v-card>
        <v-card-item>
          <v-row class="align-end">
            <v-col cols="12" md="3">
              <base-input
                v-model="filter.search"
                :label="t('contract.search')"
                :placeholder="`${t('contract.search')}...`"
                clearable
              ></base-input>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table
        :key="key"
        :tableHeader="tableHeader"
        :tableBody="applicationEventsList"
        :is-loading="loading"
        :menuList="menuList"
        @clickMenuHandler="handleMenuClick"
        :pagination="{
          page: 0,
          total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchData()
          }
        }"
      ></base-table>
      <v-dialog v-model="rejectReasonDialog" width="500">
        <v-card>
          <v-card-item>
            <v-card-title class="mb-2">{{ t('events.reject_reason') }}</v-card-title>
            <v-textarea :label="t('contract.cause')" v-model="rejectReason"></v-textarea>
            <div class="d-flex justify-end ga-2">
              <base-button color="default" @click="rejectReasonDialog = false">{{ t('close') }}</base-button>
              <base-button color="primary" @click="rejectHandler">{{ t('send') }}</base-button>
            </div>
          </v-card-item>
        </v-card>
      </v-dialog>
    </template>
  </base-page-layout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { PERMISSIONS } from '@/constants/permissions'
import { TableHeaderTypes } from '@/types/table.types'

import { ApplicationDto } from '@/services/events/dto/application.dto'
import {
  getApplicationEvents,
  approveRequest,
  rejectRequest,
  deleteRequest
} from '@/services/events/application.service'
import { TableActionListType } from '@/types/table.types'
import { useUserStore } from '@/stores/user.store'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS_REQUEST_ATTEND
  }
})
const key = ref(0)
const { t } = useI18n()
const userStore = useUserStore()

const applicationEventsList = ref<ApplicationDto[]>([])
const loading = ref(false)
const totalNumber = ref(0)
const currentPage = ref(0)
const itemsPerPage = ref(10)
const filter = ref({ search: null })
const rejectReason = ref('')
const requestId = ref(0)
const rejectReasonDialog = ref(false)

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('contract.action'),
    role: 'action',
    key: 'action',
    id: 'action',
    isVisible: (row: ApplicationDto) => {
      return (
        (userStore.getOrgId === row.initiatorId && row.statusId === 1) ||
        (row.statusId === 2 && row.initiatorId != userStore.getOrgId)
      )
    }
  },
  {
    text: 'ID',
    role: 'text',
    key: 'requestId',
    id: 'requestId'
  },
  {
    text: t('events.initiator'),
    role: 'text',
    key: 'initiatorName',
    id: 'initiatorId'
  },
  {
    text: t('events.agent_name'),
    role: 'text',
    key: 'agentName',
    id: 'agentId'
  },
  {
    text: t('events.agent_modal.procent_ticket'),
    role: 'text',
    key: 'percentInBilet',
    id: 'percentInBilet'
  },
  {
    text: t('events.agent_modal.percent_up_ticket'),
    role: 'text',
    key: 'percentOutBilet',
    id: 'percentOutBilet'
  },
  {
    text: t('events.event_name'),
    role: 'text',
    key: 'eventName',
    id: 'eventId'
  },
  {
    text: t('events.status'),
    role: 'statusLangText',
    key: 'statusName',
    id: 'statusId'
  },
  {
    text: t('events.reject_reason'),
    role: 'text',
    key: 'rejectReason',
    id: 'rejectReason'
  }
])

const menuList = ref<TableActionListType[]>([
  {
    id: 1,
    name: t('tariffs.menu.delete'),
    isVisible: (row: ApplicationDto) => {
      return userStore.getOrgId === row.initiatorId && row.statusId === 1
    }
  },
  {
    id: 2,
    name: t('events.accept'),
    isVisible: (row: ApplicationDto) => {
      return userStore.getOrgId !== row.initiatorId && row.statusId === 2
    }
  },
  {
    id: 3,
    name: t('events.reject'),
    isVisible: (row: ApplicationDto) => {
      return userStore.getOrgId !== row.initiatorId && row.statusId === 2
    }
  }
])

const handleMenuClick = ({ item, nameId }: { item: ApplicationDto; nameId: number }) => {
  switch (nameId) {
    case 1:
      deleteHandler(item.requestId)
      break
    case 2:
      approveHandler(item.requestId)
      break
    case 3:
      requestId.value = item.requestId
      rejectReasonDialog.value = true
      break
  }
}

const approveHandler = async (id: number) => {
  try {
    const { data } = await approveRequest(id)
    if (data.result.success) {
      toast.success(t('messages.updated_success'))
      fetchData()
    }
  } catch (err) {
    toast.error(getErrorMessage(err))
  }
}

const rejectHandler = async () => {
  if (!rejectReason.value) return

  rejectReasonDialog.value = false
  try {
    const { data } = await rejectRequest(requestId.value, rejectReason.value)
    if (data.result.success) {
      toast.success(t('messages.updated_success'))
      fetchData()
    }
  } catch (err) {
    toast.error(getErrorMessage(err))
  }
}

const deleteHandler = async (id: number) => {
  try {
    const { data } = await deleteRequest(id)
    if (data.result.success) {
      toast.success(t('successDeleted'))
      fetchData()
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const { data } = await getApplicationEvents({
      skip: currentPage.value,
      take: itemsPerPage.value,
      searchText: filter.value.search
    })
    applicationEventsList.value = data?.result?.data ?? []
    totalNumber.value = data?.result?.total ?? 0
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

watch(
  filter,
  () => {
    key.value++
    currentPage.value = 0
    fetchData()
  },
  { deep: true }
)
fetchData()
</script>
