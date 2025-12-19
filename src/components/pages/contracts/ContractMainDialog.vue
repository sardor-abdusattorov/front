<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:model-value', $event)" width="1500">
    <v-card class="d-flex flex-column pa-4">
      <v-card-title>{{ t('contract.choose_main_doc') }}</v-card-title>
      <div class="filter">
        <base-input v-model="filter.search" :placeholder="t('search')" clearable />
        <base-select v-model="filter.status" :item-title="`name${capitalize(locale)}`" :items="statusList" :placeholder="t('contract.status')" />
      </div>
      <v-divider></v-divider>
      <v-card-text class="flex-1 h-100 position-relative overflow-y-auto pa-0">
        <div class="table">
          <base-table
            @clickScan="getContractFile"
            :tableHeader="tableHeader"
            :tableBody="contracts"
            :is-loading="loading"
            :pagination="{
              page: 0,
              total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
              pageClickHandler: (page: number) => {
                currentPage = page - 1
                fetchData()
              }
            }"
            @radioChange="radioChange"
            :radioValue="mainContract?.id"
          >
          </base-table>
        </div>
      </v-card-text>

      <v-card-actions class="actions">
        <v-spacer></v-spacer>

        <v-btn :text="t('close')" @click="emit('update:model-value', false)"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { getContractFiles, getMyContractTable, getStatusItems } from '@/services/contracts/contracts.service'
import { ContractsDto } from '@/services/contracts/dto/contracts.dto'
import { TableHeaderTypes } from '@/types/table.types'
import { capitalize, downloadBlobAsPdf, getErrorMessage, sleep } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  modelValue: boolean
  mainContract?: ContractsDto
  secondOrgId?: number | null
  parentContractId?: number | null
}>()
const emit = defineEmits(['update:model-value', 'setMainContract'])

const { t, locale } = useI18n()

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('sold_tickets.table.choose'),
    role: 'radio',
    key: '',
    id: '',
    isVisible: (row: ContractsDto) => {
      return row.contractStatusId === 3
    }
  },

  {
    text: t('contract.id'),
    role: 'text',
    key: 'id',
    id: ''
  },
  {
    text: `${t('contract.id')} ${t('contract.main_doc')}`,
    role: 'text',
    key: 'parentId',
    id: ''
  },
  {
    text: t('contract.contractNumber'),
    role: 'phone',
    key: 'contractNumber',
    id: ''
  },
  {
    text: t('contract.conculisionDate'),
    role: 'date',
    key: 'contractDate',
    id: ''
  },
  {
    text: t('contract.dateExpire'),
    role: 'date',
    key: 'endContractDate',
    id: ''
  },
  {
    text: t('contract.initiator'),
    role: 'text',
    key: 'firstOrgName',
    id: ''
  },
  {
    text: t('contract.otherSide'),
    role: 'text',
    key: 'secondOrgName',
    id: ''
  },
  {
    text: t('contract.ticketPricePercentage'),
    role: 'text',
    key: 'percent',
    id: ''
  },
  {
    text: t('contract.aboveTicketPricePercentage'),
    role: 'text',
    key: 'percent',
    id: ''
  },
  {
    text: t('document'),
    role: 'scan',
    key: 'contractFiles',
    id: ''
  },

  {
    text: t('contract.status'),
    role: 'langText',
    key: 'contractStatusName',
    id: 'contractStatusId'
  },
  {
    text: t('contract.cause'),
    role: 'text',
    key: 'rejectReason',
    id: ''
  }
])

const contracts = ref<ContractsDto[]>([])

const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)

const itemsPerPage = ref<number>(10)
const filter = ref({
  status: null,
  search: null
})
const statusList = ref([])

const loading = ref<boolean>(false)

const getContractFile = async (item: string) => {
  try {
    const { data } = await getContractFiles(item)
    downloadBlobAsPdf(data, item)
  } catch (e) {
    return toast.error(getErrorMessage(e))
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getMyContractTable({
      skip: currentPage.value,
      take: itemsPerPage.value,
      searchText: filter.value.search,
      contractStatusId: filter.value.status,
      secondOrgId: props.secondOrgId ? props.secondOrgId : null,
      parentContractId: props.parentContractId ? props.parentContractId : null
    })
    contracts.value = data
    totalNumber.value = total
  } catch (e) {
    return toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
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

watch(() => filter.value, fetchData, { deep: true })
watch(() => props.secondOrgId, fetchData, { deep: true })

const radioChange = (row: ContractsDto) => {
  emit('setMainContract', row)
  emit('update:model-value', false)
}

onMounted(async () => {
  await sleep(1000)
  await Promise.all([fetchData(), statusListData()])
})
</script>

<style lang="scss" scoped>
.pagination {
  position: sticky;
  left: 0;
  bottom: 0;
  padding: 12px 24px;
  background: #f5f5f5;
}
.filter {
  position: sticky;
  top: 0;
  padding: 12px 24px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 575px) {
  .actions {
    padding: 20px;
  }
  .filter {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
