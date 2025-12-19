<template>
  <div>
    <base-page-layout :title="t('contract.organization')" :is-loading="isFetching">
      <template #actions>
        <PaymentTypeDialog ref="paymentDialog" />
        <base-button v-if="userStore.user?.structureId !== STRUCTURES.SUPERVISOR" to="/company/organization/add">{{ t('actions.create') }}</base-button>
      </template>
      <template #filter>
        <v-card class="py-3">
          <v-card-item>
            <v-row>
              <v-col cols="12" md="3">
                <base-input
                  v-model="filter.name"
                  :label="t('halls.name')"
                  :placeholder="t('contract.search')"
                ></base-input>
              </v-col>
              <v-col cols="12" md="3" v-if="userStore.user?.structureId !== STRUCTURES.SUPERVISOR">
                <base-select
                  :label="t('type')"
                  placeholder=""
                  :item-title="currentTypeTitle"
                  :items="currentTypeList"
                  v-model="filter.type"
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
            </v-row>
          </v-card-item>
        </v-card>
      </template>
      <template #content>
        <base-table
          :key="organizationKey"
          v-if="tableBody"
          :table-header="tableHeader"
          :table-body="tableBody"
          :menu-list="menuList"
          @click-menu-handler="handleMenuClick"
          @click-preview="handlePreview"
          :pagination="{
            page: 0,
            total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
            pageClickHandler: (page: number) => {
              currentPage = page - 1
              fetchCompanyByStructureId()
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
import {
  approveCompany,
  getCompanyByStructureId,
  getCompanyStructureList,
  rejectCompany
} from '@/services/organization/organization.service'
import { TableHeaderTypes } from '@/types/table.types'
import router from '@/router'
import { STRUCTURES } from '@/constants/structures'
import { CompanyByStructureListDto } from '@/services/organization/dto/organization.dto'
import PaymentTypeDialog from '@/components/pages/company/organization/PaymentTypeDialog.vue'
import { capitalize, getErrorMessage } from '@/utils/functions'
import { useUserStore } from '@/stores/user.store'
import { useRules } from '@/utils/rules'
import { toast } from 'vue3-toastify'
import { useCashierStore } from '@/stores/cashier.store'

definePage({
  meta: {
    permission: PERMISSIONS.ORGANIZATION
  }
})

interface ChildComponentExposed {
  openDialog: (orgId: number) => void
}

const cashierStore = useCashierStore()

const userStore = useUserStore()
const { t, locale } = useI18n()
const rules = useRules()
const commandState = ref({
  add: true,
  show: true,
  edit: true,
  delete: false,
  details: false
})
const organizationKey = ref(0)
const paymentDialog = ref<(InstanceType<typeof PaymentTypeDialog> & ChildComponentExposed) | null>(null)
const totalNumber = ref<number | undefined>(0)
const isFetching = ref(false)
const isValid = ref(false)
const rejectReason = ref('')
const selectedId = ref<number>(0)
const submitLoading = ref(false)
const rejectReasonDialog = ref(false)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const filter = ref<{ name: string; type: number | null; statusId: number | null }>({
  name: '',
  type: null,
  statusId: null
})

const statusList = ref<{ value: number; text: string }[]>([
  { value: 1, text: t('new') },
  { value: 2, text: t('approved') },
  { value: 3, text: t('rejected') },
  { value: 4, text: t('edited') }
])

const currentTypeList = computed(() => {
  return typeList.value
})

const currentTypeTitle = computed(() => {
  return `name${capitalize(locale.value)}`
})

const typeList = ref<{ value: number; text: string }[]>([])
const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('contract.action'),
    role: 'action',
    key: 'action',
    id: ''
  },
  {
    text: t('halls.name'),
    role: 'text',
    key: 'name',
    id: ''
  },
  {
    text: t('type'),
    role: 'langText',
    key: 'structureName',
    id: ''
  },
  {
    text: t('user.inn'),
    role: 'text',
    key: 'tin',
    id: ''
  },
  {
    text: t('halls.address'),
    role: 'text',
    key: 'address',
    id: ''
  },
  {
    text: t('user.phone'),
    role: 'phone',
    key: 'phones',
    id: ''
  },
  {
    text: t('fax'),
    role: 'phone',
    key: 'faxPhones',
    id: ''
  },
  {
    text: t('user.users'),
    role: 'preview',
    key: '',
    id: ''
  },
  {
    text: t('createdDate'),
    role: 'dataTime',
    key: 'createdDate',
    id: ''
  },
  {
    text: t('status'),
    role: 'orgStatus',
    key: 'statusId',
    id: ''
  },
  {
    text: t('report.statisticsTicket.activity'),
    role: 'checkbox',
    key: 'isActive',
    id: ''
  },
  {
    text: t('cashDesk'),
    role: 'checkbox',
    key: 'haveCashbox',
    id: ''
  },
  {
    text: t('balance'),
    role: 'sum',
    key: 'saldo',
    id: 'contractStatusId'
  },
  {
    text: t('typeOfWork'),
    role: 'text',
    render: (row: CompanyByStructureListDto) => {
      if (row.structureId === STRUCTURES.AGENT || row.structureId === STRUCTURES.MUZEY) {
        if (row.debtLimit > 0) {
          return t('onCredit')
        } else {
          return t('withDeposit')
        }
      } else {
        return ''
      }
    },
    key: 'rejectReason',
    id: ''
  },
  {
    text: t('debtLimit'),
    role: 'sum',
    key: 'debtLimit',
    id: ''
  }
])

const tableBody = ref()
const menuList = computed(() => {
  return [
    { id: 1, name: t('actions.edit'), isVisible: commandState.value.edit },
    { id: 2, name: t('cash.createPayment') },
    { id: 3, name: t('cash.viewPayments') },
    {
      id: 4,
      name: t('cash.paymentTypes'),
      isVisible: (row: CompanyByStructureListDto) => {
        return (
          row.structureId === STRUCTURES.MUZEY ||
          row.structureId === STRUCTURES.AGENT ||
          row.structureId === STRUCTURES.TEATR ||
          row.structureId === STRUCTURES.TOUR_AGENT
        )
      }
    },
    {
      id: 5,
      name: t('events.accept'),
      isVisible: (row: CompanyByStructureListDto) => {
        return userStore.user?.structureId === STRUCTURES.SUPERVISOR && (row.statusId === 1 || row.statusId === 4)
      }
    },
    {
      id: 6,
      name: t('events.reject'),
      isVisible: (row: CompanyByStructureListDto) => {
        return userStore.user?.structureId === STRUCTURES.SUPERVISOR && (row.statusId === 1 || row.statusId === 4)
      }
    }
  ]
})

const fetchTypeList = async () => {
  try {
    const {
      data: { result }
    } = await getCompanyStructureList()
    typeList.value = result
  } catch (e) {
    return { error: e }
  }
}

const companyParams = computed(() => {
  if (userStore.user?.structureId === STRUCTURES.SUPERVISOR) {
    return {
      searchText: filter.value.name,
      statusId: filter.value.statusId as number,
      skip: currentPage.value,
      take: itemsPerPage.value
    }
  }

  return {
    searchText: filter.value.name,
    statusId: filter.value.statusId as number,
    structureId: filter.value.type as number,
    skip: currentPage.value,
    take: itemsPerPage.value
  }
})

const fetchCompanyByStructureId = async () => {
  try {
    const {
      data: { result }
    } = await getCompanyByStructureId(companyParams.value)
    tableBody.value = result.data
    totalNumber.value = result.total
  } catch (e) {
    return { error: e }
  }
}

const approveCompanyFunc = async (id: number) => {
  isFetching.value = true
  try {
    await approveCompany({ orgid: id })
    await fetchCompanyByStructureId()
  } catch (e) {
    return { error: e }
  } finally {
    isFetching.value = false
    cashierStore.isReportsLoad = true
  }
}

const handleReject = async () => {
  if (!isValid.value) return
  try {
    submitLoading.value = true
    await rejectCompany({ id: selectedId.value, reject_reason: rejectReason.value })
    toast.success(t('contract.successfully'))
    rejectReasonDialog.value = false
    await fetchCompanyByStructureId()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    submitLoading.value = false
    cashierStore.isReportsLoad = true
  }
}

const handlePreview = (organization: any) => {
  router.push({ path: `/admin/users-organizations`, query: { orgId: organization.id } })
}

const handleMenuClick = async (data: { id: number; nameId: number }) => {
  switch (data?.nameId) {
    case 1:
      router.push(`/company/organization/update/${data.id}`)
      // Confirm
      break
    case 2:
      if (userStore.user?.structureId === STRUCTURES.SUPERVISOR) {
        router.push(`/payment-transactions/add?orgId=${data.id}`)
      } else {
        router.push(`/payment/payment-in/add/${data.id}`)
      }
      // Reject
      break
    case 3:
      if (userStore.user?.structureId === STRUCTURES.SUPERVISOR) {
        router.push(`/payment-transactions?orgId=${data.id}`)
      } else {
        router.push('/payment/payment-in/list/' + data.id)
      }
      break
    case 4:
      if (paymentDialog.value) {
        await paymentDialog.value.openDialog(data.id)
      }
      break
    case 5:
      approveCompanyFunc(data.id)
      break
    case 6:
      selectedId.value = data.id
      rejectReasonDialog.value = true
      break
    default:
      break
  }
}

watch(
  filter,
  () => {
    currentPage.value = 0
    organizationKey.value++
    fetchCompanyByStructureId()
  },
  { deep: true }
)

onMounted(async () => {
  try {
    isFetching.value = true
    await fetchTypeList()
    await fetchCompanyByStructureId()
  } catch (e) {
    return { error: e }
  } finally {
    isFetching.value = false
  }
})
</script>
