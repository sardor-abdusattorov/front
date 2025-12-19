<template>
  <base-page-layout :title="t('contract.contracts')" :is-loading="loading">
    <template #actions>
      <base-button
        v-if="
          userStore.user?.structureId !== STRUCTURES.EMITENT &&
          userStore.user?.structureId !== STRUCTURES.SUPER_USER &&
          userStore.user?.structureId !== STRUCTURES.TOUR_AGENT &&
          userStore.user?.structureId !== STRUCTURES.SUPERVISOR
        "
        @click="router.push('/contract/contracts/add')"
        >{{ t('contract.add') }}</base-button
      >
      <SignDialog ref="signDialogRef" @update="fetchAll"></SignDialog>
      <RejectContractDialog ref="rejectDialogRef" @update="fetchAll" />
    </template>
    <template #filter>
      <v-card class="py-3">
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-input
                v-model="filter.search"
                :label="t('contract.search')"
                :placeholder="t('contract.search')"
                clearable
              ></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select
                :label="t('contract.status')"
                :placeholder="t('contract.status')"
                :items="statusList"
                :item-title="`name${capitalize(locale)}`"
                v-model="filter.status"
              ></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-date-input
                v-model="filter.date"
                :label="t('contract.dateExpire')"
                :placeholder="t('contract.dateExpire')"
              ></base-date-input>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table
        :key="contractKey"
        :tableHeader="tableHeader"
        :tableBody="contracts"
        :is-loading="loading"
        :menuList="menuList"
        @clickMenuHandler="handleMenuClick"
        @clickScan="getContractFile"
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
</template>

<script lang="ts" setup>
import type { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { useI18n } from 'vue-i18n'
import { PERMISSIONS } from '@/constants/permissions'
import {
  acceptContract,
  contractAnulled,
  getContractFiles,
  getContractTable,
  getStatusItems,
  updateSendContractId
} from '@/services/contracts/contracts.service'
import { ContractsDto } from '@/services/contracts/dto/contracts.dto'
import router from '@/router'
import { toast } from 'vue3-toastify'
import { capitalize, downloadBlobAsPdf, getErrorMessage } from '@/utils/functions'
import SignDialog from '@/components/dialogs/SignDialog.vue'
import RejectContractDialog from '@/components/pages/contracts/RejectContractDialog.vue'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'

definePage({
  meta: {
    permission: PERMISSIONS.CONTRACTS
  }
})

interface ChildComponentExposed {
  openModal: (contractId: number) => void
}

const { t, locale } = useI18n()
const userStore = useUserStore()
const contractKey = ref(0)
const contracts = ref<ContractsDto[]>([])
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const statusList = ref<object[]>([])
const signDialogRef = ref<(InstanceType<typeof SignDialog> & ChildComponentExposed) | null>(null)
const rejectDialogRef = ref<(InstanceType<typeof RejectContractDialog> & ChildComponentExposed) | null>(null)
const itemsPerPage = ref<number>(10)
const loading = ref(false)
const filter = ref({
  status: null,
  search: null,
  date: null
})
const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('contract.action'),
    role: 'action',
    key: 'action',
    id: 1
  },
  {
    text: t('contract.id'),
    role: 'text',
    key: 'id',
    id: 2
  },
  {
    text: t('main_contract_id'),
    role: 'text',
    key: 'parentId',
    id: 2
  },
  {
    text: t('events.other_contract_event_name'),
    role: 'text',
    key: 'eventName',
    id: 14
  },
  {
    text: t('contract.contractNumber'),
    role: 'text',
    key: 'contractNumber',
    id: 3
  },
  {
    text: t('contract.conculisionDate'),
    role: 'date',
    key: 'contractDate',
    id: 4
  },
  {
    text: t('contract.dateExpire'),
    role: 'date',
    key: 'endContractDate',
    id: 5
  },
  {
    text: t('contract.tinInitiator'),
    role: 'text',
    key: 'firstOrgTin',
    id: 13
  },
  {
    text: t('contract.initiator'),
    role: 'text',
    key: 'firstOrgName',
    id: 6
  },
  {
    text: t('contract.tinOtherSide'),
    role: 'text',
    key: 'secondOrgTin',
    id: 6
  },
  {
    text: t('contract.otherSide'),
    role: 'text',
    key: 'secondOrgName',
    id: 7
  },
  {
    text: t('contract.ticketPricePercentage'),
    role: 'text',
    key: 'percent',
    id: 8,
    render: (row: any) => {
      return row.isPercentInBilet ? row.percent : 0
    }
  },
  {
    text: t('contract.aboveTicketPricePercentage'),
    role: 'text',
    key: 'percent',
    id: 9,
    render: (row: any) => {
      return !row.isPercentInBilet ? row.percent : 0
    }
  },
  {
    text: t('document'),
    role: 'scan',
    key: 'filePath',
    id: 10
  },

  {
    text: t('contract.status'),
    role: 'statusLangText',
    key: 'contractStatusName',
    id: 'contractStatusId'
  },
  {
    text: t('contract.cause'),
    role: 'text',
    key: 'rejectReason',
    id: 12
  }
])
const menuList = ref<TableActionListType[]>([
  {
    id: 1,
    name: t('contract.menu.sign'),
    isVisible: (row: ContractsDto) => checkContract(row, 7)
  },
  {
    id: 2,
    name: t('contract.menu.send'),
    isVisible: (row: ContractsDto) => checkContract(row, 4)
  },
  {
    id: 3,
    name: t('contract.menu.accept_contract'),
    isVisible: (row: ContractsDto) => checkContract(row, 5)
  },
  {
    id: 4,
    name: t('contract.menu.reject'),
    isVisible: (row: ContractsDto) => checkContract(row, 6)
  },
  {
    id: 5,
    name: t('contract.menu.revoke'),
    isVisible: (row: ContractsDto) => checkContract(row, 8)
  },
  {
    id: 6,
    name: t('contract.menu.edit'),
    isVisible: (row: ContractsDto) => checkContract(row, 1)
  },
  {
    id: 7,
    name: t('contract.menu.other_percent'),
    isVisible: (row: ContractsDto) => checkContract(row, 2)
  },
  {
    id: 8,
    name: t('contract.menu.accept_percent'),
    isVisible: (row: ContractsDto) => checkContract(row, 3)
  },
  {
    id: 9,
    name: t('events.menu.view')
  }
])

const checkContract = (row: ContractsDto, id: number) => {
  return row.contractActions.includes(id)
}
const handleMenuClick = async (val: { nameId: number; id: number }) => {
  switch (val.nameId) {
    case 1:
      await handleSign(val.id)
      break
    case 2:
      handleSend(val.id)
      break
    case 3:
      handleAcceptContract(val.id)
      break
    case 4:
      contractReject(val.id)
      break
    case 5:
      contractAnnulled(val.id)
      break
    case 6:
      router.push({ name: '/contract/contracts/update/[id]', params: { id: val.id.toString() } })
      break
    case 7:
      break
    case 8:
      break
    case 9:
      router.push({ name: '/contract/contracts/view/[id]', params: { id: val.id.toString() } })
      break
    default:
      break
  }
}
const contractAnnulled = async (id: number) => {
  try {
    const { data } = await contractAnulled(id)
    if (data.result.success) {
      toast.success(t('contract.successfully'))
      fetchData()
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const contractReject = async (id: number) => {
  rejectDialogRef.value?.openModal(id)
}
const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getContractTable({
      skip: currentPage.value,
      take: itemsPerPage.value,
      searchText: filter.value.search,
      contractStatusId: filter.value.status,
      endContractDate: filter.value.date,
      isAbonents: false
    })
    contracts.value = data
    totalNumber.value = total
  } catch (e) {
    return toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}
const handleSend = async (id: number) => {
  try {
    await updateSendContractId(id)
    toast.success(t('contract.successfully'))
    await fetchData()
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const handleSign = async (id: number) => {
  signDialogRef.value?.openModal(id)
}
const handleAcceptContract = async (id: number) => {
  try {
    await acceptContract(id)
    toast.success(t('contract.successfully'))
    await fetchData()
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const getContractFile = async (item: string) => {
  try {
    const { data } = await getContractFiles(item)
    downloadBlobAsPdf(data, item)
  } catch (e) {
    console.log(e)
    return toast.error(getErrorMessage(e))
  }
}
const statusListData = async () => {
  try {
    const {
      data: { result }
    } = await getStatusItems()
    statusList.value = result
  } catch (e) {
    return toast.error(getErrorMessage(e))
  }
}
const fetchAll = async () => {
  await Promise.all([fetchData(), statusListData()])
}

watch(
  filter,
  () => {
    currentPage.value = 0
    contractKey.value++
    fetchData()
  },
  { deep: true }
)

onMounted(async () => {
  await fetchAll()
})
</script>