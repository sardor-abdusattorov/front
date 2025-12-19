<template>
  <base-page-layout :title="t('templates')" :is-loading="loading">
    <template #actions>
      <base-button @click="router.push('/contract/templates/add')">{{ t('contract.add') }}</base-button>
    </template>
    <template #filter>
      <v-card class="py-3">
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-select
                  density="comfortable"
                  :rules="[rules.required]"
                  v-model="filter.type"
                  :items="typeList"
                  item-title="name"
                  item-value="value"
                  :placeholder="t('type')"
                ></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table
        :key="contractKey"
        :tableHeader="tableHeader"
        :tableBody="templates"
        :is-loading="loading"
        :menuList="menuList"
        @clickMenuHandler="handleMenuClick"
        @clickScan="getTemplateFile"
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
  deActiveContractTemplate,
  getActiveContractTemplates,
  getContractFiles,
  getContractTable,
  getStatusItems,
  getTemplateFiles,
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
import { useRules } from '@/utils/rules'

definePage({
  meta: {
    permission: PERMISSIONS.CONTRACTS
  }
})


interface TemplateDto {
  id: number
  name: string
  comment: string
  filePath: string
  isActive: boolean
  contractActions: number[]
}

interface ChildComponentExposed {
  openModal: (contractId: number) => void
}

const rules = useRules()
const { t, locale } = useI18n()
const userStore = useUserStore()
const contractKey = ref(0)
const templates = ref<ContractsDto[]>([])
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
  date: null,
  type: null
})

const typeList = ref([
  { name: t('privacyPolicyTemplate'), value: 1 },
  { name: t('publicOfferTemplate'), value: 2 },
])
const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('contract.action'),
    role: 'action',
    key: 'action',
    id: 0
  },
  {
    text: t('report.statisticsTicket.activity'),
    role: 'checkbox',
    key: 'isActive',
    id: ''
  },
  {
    text: t('name'),
    role: 'text',
    key: 'name',
    id: 1
  },
  {
    text: t('contract.comment'),
    role: 'text',
    key: 'comment',
    id: 2
  },
  {
    text: t('type'),
    role: 'text',
    key: '',
    id: 5,
    render: (row: any) => {
      return row.type === 1 ? t('privacyPolicyTemplate') : t('publicOfferTemplate')
    },
  },
  {
    text: t('date'),
    role: 'date',
    key: 'date',
    id: 4
  },
  {
    text: t('document'),
    role: 'scan',
    key: 'filePath',
    id: 3
  }
])
const menuList = ref<TableActionListType[]>([
  {
    id: 1,
    name: t('activate'),
    isVisible: (row: TemplateDto) => !row.isActive
  }
])

const handleMenuClick = async (val: { nameId: number; id: number }) => {
  switch (val.nameId) {
    case 1:
      await deActiveContractTemplate(val.id)
      await fetchData()
      break
    case 2:
      // handleSend(val.id)
      break
    case 3:
      // handleAcceptContract(val.id)
      break
    default:
      break
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getActiveContractTemplates({
      skip: currentPage.value,
      take: itemsPerPage.value,
      type: filter.value.type
    })
    templates.value = data
    totalNumber.value = total
  } catch (e) {
    return toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const getTemplateFile = async (item: string) => {
  try {
    const { data } = await getTemplateFiles(item)
    downloadBlobAsPdf(data, item)
  } catch (e) {
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
