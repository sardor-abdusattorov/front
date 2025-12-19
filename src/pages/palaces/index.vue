<template>
  <base-page-layout :title="t('halls.title')" :is-loading="loading">
    <template #actions>
      <base-button to="/palaces/add">{{ t('actions.create') }}</base-button>
    </template>
    <template #filter>
      <v-card class="py-3">
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-select :label="t('report.statisticsTicket.activity')"
                :placeholder="t('report.statisticsTicket.activity')" :items="[
                  { text: t('active'), value: true },
                  { text: t('inactive'), value: false }
                ]" item-text="text" item-value="value" v-model="filter.active"></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-input v-model="filter.search" :label="t('search')" :placeholder="t('search')"
                clearable></base-input>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table :key="key" :tableHeader="tableHeader" :tableBody="palace" :is-loading="loading" :menuList="menuList"
        @clickMenuHandler="handleMenuClick" :pagination="{
          page: currentPage,
          total: Math.ceil(totalNumber ? totalNumber / itemsPerPage : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchData()
          }
        }"></base-table>
    </template>
  </base-page-layout>
  <teleport to="body">
    <delete-dialog v-model="isDeleteDialogOpen" :id="selectedId" @removeElement="deleteHandler" />
    <confirm-dialog v-model="isConfirmDialogOpen" :text="t('palace_send_confirm')" :id="selectedId"
      @confirm="confirmHandler" />
    <confirm-dialog v-model="isApproveModalOpen" :text="t('palace_approve_confirm')" :id="selectedId"
      @confirm="approveHandler" />
    <v-dialog width="500" v-model="rejectReasonDialog">
      <v-card>
        <v-card-item>
          <v-form ref="submitFormRef" @submit.prevent="handleReject" v-model="isValid">
            <v-row>
              <v-col cols="12" md="12">
                <base-input :rules="[rules.required]" :placeholder="t('contract.cause')" v-model="rejectReason"
                  :label="t('contract.cause')"></base-input>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="12">
                <base-button :loading="submitLoading" type="submit" color="primary">{{ t('reject') }}</base-button>
              </v-col>
            </v-row>
          </v-form>
        </v-card-item>
      </v-card>
    </v-dialog>
  </teleport>
</template>

<script lang="ts" setup>
import type { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { useI18n } from 'vue-i18n'
import { PalaceDto } from '@/services/palace/dto/palace.dto'
import {
  getPalaceRemove,
  getPalaceTable,
  palaceApproveById,
  palaceRejectById,
  sendPalaceToFond
} from '@/services/palace/palace.service'
import { PERMISSIONS } from '@/constants/permissions'
import { toast } from 'vue3-toastify'
import { getErrorMessage, capitalize } from '@/utils/functions'
import { useUserStore } from '@/stores/user.store'
import { useRules } from '@/utils/rules'
definePage({
  meta: {
    permission: PERMISSIONS.PALACES
  }
})

const { t, locale } = useI18n()

const palace = ref<PalaceDto[]>([])
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const loading = ref(false)
const submitLoading = ref(false)
const router = useRouter()
const isValid = ref(false)
const isDeleteDialogOpen = ref(false)
const isConfirmDialogOpen = ref(false)
const isApproveModalOpen = ref(false)
const rejectReasonDialog = ref(false)
const rejectReason = ref('')
const key = ref(0)
const filter = ref({
  active: null,
  search: ''
})

const rules = useRules()
const userStore = useUserStore()
const selectedId = ref<number>(0)

const menuList = ref<TableActionListType[]>([
  {
    id: 1,
    name: t('confirm'),
    isVisible: (row: PalaceDto) => {
      return userStore.isFond && (row.palaceStatusId === 2 || row.palaceStatusId === 1)
    }
  },
  {
    id: 2,
    name: t('reject'),
    isVisible: (row: PalaceDto) => {
      return userStore.isFond && (row.palaceStatusId === 2 || row.palaceStatusId === 1)
    }
  },
  {
    id: 3,
    name: t('send'),
    isVisible: (row: PalaceDto) => {
      return !userStore.isFond && row.palaceStatusId === 1
    }
  },
  {
    id: 4,
    name: t('schema_hall'),
    isVisible: (row: PalaceDto) => {
      return row.isPalaceHall || userStore.isSuperUser
    }
  },
  { id: 5, name: t('actions.edit'), isVisible: true },
  { id: 6, name: t('actions.delete'), isVisible: !userStore.isSuperUser }
])

const tableHeader = ref<TableHeaderTypes[]>([
  { text: t('contract.action'), role: 'action', key: 'action', id: 1 },
  { text: t('halls.palace_image'), role: 'image', key: 'photos', id: 2 },
  { text: t('halls.name'), role: 'text', key: 'name', id: 3 },
  { text: t('contract.organization'), role: 'text', key: 'orgName', id: 3 },
  { text: t('halls.address'), role: 'text', key: 'address', id: 4 },
  { text: t('assets'), role: 'checkbox', key: 'isActive', id: 5 },
  { text: t('everyDay'), role: 'checkbox', key: 'isEveryDay', id: 6 },
  { text: t('user.phone'), role: 'phone', key: 'phone', id: 7 },
  { text: t('halls.startTime'), role: 'text', key: 'startWork', id: 8 },
  { text: t('halls.endTime'), role: 'text', key: 'endWork', id: 9 },
  { text: t('report.statisticsTicket.status'), role: 'text', key: `palaceStatusName${capitalize(locale.value)}`, id: 10 },
  { text: t('contract.cause'), role: 'text', key: 'rejectReason', id: 11 }
])

const handleMenuClick = async (data: { id: number; nameId: number }) => {
  switch (data?.nameId) {
    case 1:
      selectedId.value = data.id
      isApproveModalOpen.value = true
      break
    case 2:
      // Reject
      selectedId.value = data.id
      rejectReasonDialog.value = true
      break
    case 3:
      selectedId.value = data.id
      isConfirmDialogOpen.value = true
      break
    case 4:
      // eslint-disable-next-line no-case-declarations
      const selectedPalace = palace.value.find((item) => item.id === data.id)
      router.push(`/palaces/schemas/${data.id}?name=${selectedPalace?.name}`)
      break
    case 5:
      router.push(`/palaces/${data.id}`)
      break
    case 6:
      selectedId.value = data.id
      isDeleteDialogOpen.value = true
      break
    default:
      break
  }
}

const deleteHandler = async (id: number) => {
  try {
    await getPalaceRemove(id)
    toast.success(t('messages.deleted_success'))
    await fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const confirmHandler = async (id: number) => {
  try {
    await sendPalaceToFond(id)
    toast.success(t('contract.successfully'))
    await fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const handleReject = async () => {
  if (!isValid.value) return
  try {
    submitLoading.value = true
    await palaceRejectById(selectedId.value, rejectReason.value)
    toast.success(t('contract.successfully'))
    rejectReasonDialog.value = false
    await fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    submitLoading.value = false
  }
}

const approveHandler = async (id: number) => {
  try {
    await palaceApproveById(id)
    toast.success(t('contract.successfully'))
    await fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getPalaceTable({
      skip: currentPage.value,
      take: itemsPerPage.value,
      searchText: filter.value.search,
      IsActive: filter.value.active
    })
    palace.value = data
    totalNumber.value = total
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

watch(
  [filter],
  () => {
    currentPage.value = 0
    key.value++
    fetchData()
  },
  { deep: true, immediate: true }
)
</script>
