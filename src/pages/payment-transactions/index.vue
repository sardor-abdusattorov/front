<template>
  <div>
    <base-page-layout :title="t('paymenttransactions')" :is-loading="isFetching">
      <template #actions>
        <base-button class="rounded-xl" :to="`/payment-transactions/add`">{{ t('actions.create') }}</base-button>
      </template>
      <template #filter>
        <v-card class="py-3">
          <v-card-item>
            <v-row>
              <v-col cols="12" md="3" v-if="userStore.user?.structureId === STRUCTURES.SUPERVISOR">
                <base-select
                  :label="t('tourAgents')"
                  placeholder=""
                  item-title="name"
                  item-value="id"
                  :items="tourAgentList"
                  v-model="filter.orgId"
                ></base-select>
              </v-col>
              <v-col cols="12" md="3">
                <base-select
                  :label="t('status')"
                  placeholder=""
                  item-title="text"
                  :items="statusList"
                  v-model="filter.statusId"
                ></base-select>
              </v-col>
              <v-col cols="12" md="3">
                <base-date-input v-model="filter.from" :label="t('from')" />
              </v-col>
              <v-col cols="12" md="3">
                <base-date-input v-model="filter.to" :label="t('to')" />
              </v-col>
            </v-row>
          </v-card-item>
        </v-card>
      </template>
      <template #content>
        <base-table
          v-if="tableBody"
          :table-header="tableHeader"
          :table-body="tableBody"
          :menu-list="menuList"
          @clickScan="getTransactionFile"
          @click-menu-handler="handleMenuClick"
          @click-preview="handlePreview"
          :pagination="{
            page: 0,
            total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
            pageClickHandler: (page: number) => {
              currentPage = page - 1
              fetchList()
            }
          }"
        ></base-table>
      </template>
    </base-page-layout>
    <v-dialog width="500" v-model="rejectReasonDialog">
      <v-card>
        <v-card-item>
          <v-form ref="submitFormRef" @submit.prevent="handleReject" v-model="isValid">
            <v-row>
              <v-col cols="12" md="12">
                <base-input
                  :rules="[rules.required]"
                  :placeholder="t('contract.cause')"
                  v-model="rejectReason"
                  :label="t('contract.cause')"
                ></base-input>
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
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PERMISSIONS } from '@/constants/permissions'
import { TableHeaderTypes } from '@/types/table.types'
import {
  ApproveTourAgentInvoice,
  DeleteGetTourAgentInvoice,
  GetTourAgentInvoice,
  RejectTourAgentInvoice,
  SendTourAgentInvoice
} from '@/services/payment/payment.service'
import { InvoicePageGetAllData } from '@/services/payment/model/payment.model'
import { toast } from 'vue3-toastify'
import { downloadBlobAsPdf, getErrorMessage } from '@/utils/functions'
import { useRules } from '@/utils/rules'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'
import { getContractFiles, getTourAgentList } from '@/services/contracts/contracts.service'

definePage({
  meta: {
    permission: PERMISSIONS.PAYMENT_TRANSACTION
  }
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const rules = useRules()
const userStore = useUserStore()

const statusList = ref<{ value: number; text: string }[]>([
  { value: 1, text: t('new') },
  { value: 2, text: t('sended') },
  { value: 3, text: t('approved') },
  { value: 4, text: t('rejected') }
])

const filter = ref({
  orgId: route.query.orgId ? Number(route.query.orgId) : null,
  statusId: null,
  from: null,
  to: null
})

const isFetching = ref(false)
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const tourAgentList = ref<any[]>([])
const selectedId = ref<number | null>(null)
const rejectReasonDialog = ref(false)
const rejectReason = ref('')
const submitLoading = ref(false)
const isValid = ref(false)

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('contract.action'),
    role: 'action',
    key: 'action',
    id: '',
    isVisible: (row: InvoicePageGetAllData) => {
      return !row.isApprove
    }
  },
  {
    text: t('dataOfReplenishment'),
    role: 'date',
    key: 'invoiceDate',
    id: ''
  },
  {
    text: t('replenishmentTime'),
    role: 'time',
    key: 'invoiceDate',
    id: ''
  },
  {
    text: t('contract.comment'),
    role: 'text',
    key: 'comment',
    id: ''
  },
  {
    text: t('document'),
    role: 'scan',
    key: 'filePath',
    id: ''
  },
  {
    text: t('contract.status'),
    role: 'invoiceStatus',
    key: 'statusId',
    id: ''
  }
])
const tableBody = ref()
const menuList = computed(() => {
  return [
    {
      id: 0,
      name: t('actions.view')
    },
    {
      id: 1,
      name: t('actions.edit'),
      isVisible: (row: any) => {
        return row.statusId === 1 && row.statusId === 4
      }
    },
    {
      id: 2,
      name: t('approve'),
      isVisible: (row: any) => {
        return (row.statusId === 1 || row.statusId === 2) && userStore.user?.structureId === STRUCTURES.SUPERVISOR
      }
    },
    {
      id: 3,
      name: t('reject'),
      isVisible: (row: any) =>
        (row.statusId === 1 || row.statusId === 2) && userStore.user?.structureId === STRUCTURES.SUPERVISOR
    },
    {
      id: 4,
      name: t('send'),
      isVisible: (row: any) => {
        return row.statusId === 1 && userStore.user?.structureId === STRUCTURES.TOUR_AGENT
      }
    },
    { id: 5, name: t('tariffs.menu.delete'), isVisible: (row: any) => row.statusId === 1 }
  ]
})

const getTransactionFile = async (item: string) => {
  try {
    const { data } = await getContractFiles(item)
    downloadBlobAsPdf(data, item)
  } catch (e) {
    return toast.error(getErrorMessage(e))
  }
}

const fetchTourAgents = async () => {
  try {
    const {
      data: { result }
    } = await getTourAgentList()
    tourAgentList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const handleReject = async () => {
  if (!isValid.value) return
  try {
    submitLoading.value = true
    await RejectTourAgentInvoice({ id: selectedId.value as number, rejectReason: rejectReason.value })
    toast.success(t('contract.successfully'))
    rejectReasonDialog.value = false
    await fetchList()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    submitLoading.value = false
  }
}

const handleMenuClick = async (data: any) => {
  switch (data.nameId) {
    case 0:
      router.push(`/payment-transactions/view/${data.id}`)
      break
    case 1:
      router.push(`/payment-transactions/update/${data.id}`)
      break
    case 2:
      try {
        await ApproveTourAgentInvoice(data.id)
        toast.success(t('contract.successfully'))
        await fetchList()
        window.location.reload()
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
      break
    case 3:
      selectedId.value = data.id
      rejectReasonDialog.value = true
      break
    case 4:
      try {
        await SendTourAgentInvoice(data.id)
        await fetchList()
      } catch (e) {
        toast.error(getErrorMessage(e))
      }
      break
    case 5:
      await handleDelete(data.id)
      break
    default:
      break
  }
}

const handlePreview = (data: any) => {
  console.log(data)
}

const handleDelete = async (id: number) => {
  try {
    await DeleteGetTourAgentInvoice(id)
    toast.success(t('tariffs.successfullyDeleted'))
    await fetchList()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const currentParams = computed(() => {
  if (userStore.user?.structureId === STRUCTURES.SUPERVISOR) {
    return {
      skip: currentPage.value,
      take: itemsPerPage.value,
      orgId: filter.value.orgId,
      from: filter.value.from,
      to: filter.value.to,
      statusId: filter.value.statusId
    }
  } else {
    return {
      skip: currentPage.value,
      take: itemsPerPage.value,
      from: filter.value.from,
      to: filter.value.to,
      statusId: filter.value.statusId
    }
  }
})

const fetchList = async () => {
  try {
    isFetching.value = true
    const {
      data: { result }
    } = await GetTourAgentInvoice(currentParams.value)
    tableBody.value = result.data
    totalNumber.value = result.count
  } catch (error) {
    console.error(error)
  } finally {
    isFetching.value = false
  }
}

watch(
  () => filter.value,
  async () => {
    await fetchList()
  },
  { deep: true }
)

onMounted(async () => {
  await fetchList()
  if (userStore.user?.structureId === STRUCTURES.SUPERVISOR) {
    await fetchTourAgents()
  }
})
</script>

<style scoped></style>
