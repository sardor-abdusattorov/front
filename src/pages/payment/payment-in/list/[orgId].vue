<template>
  <base-page-layout :title="t('incomingPayments')" :is-loading="isFetching">
    <template #actions>
      <base-button class="rounded-xl" :to="`/payment/payment-in/add/${params.orgId}`">{{
        t('actions.create')
      }}</base-button>
    </template>
    <template #content>
      <base-table
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
            fetchList()
          }
        }"
      ></base-table>
    </template>
  </base-page-layout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PERMISSIONS } from '@/constants/permissions'
import { TableHeaderTypes } from '@/types/table.types'
import { ApproveInvoice, DeleteInvoice, InvoicePageGetAll } from '@/services/payment/payment.service'
import { InvoicePageGetAllData } from '@/services/payment/model/payment.model'
import { toast } from 'vue3-toastify'

definePage({
  meta: {
    permission: PERMISSIONS.ORGANIZATION
  }
})

interface RouteParams {
  orgId?: string
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const params = route.params as RouteParams

const isFetching = ref(false)
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('approved'),
    role: 'checkbox',
    key: 'isApprove',
    id: ''
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
    text: t('replenishmentAmount'),
    role: 'text',
    key: 'summa',
    id: ''
  },
  {
    text: t('senderBank'),
    role: 'text',
    key: 'buyerMFO',
    id: ''
  },
  {
    text: t('recipientBank'),
    role: 'text',
    key: 'sellerMfo',
    id: ''
  },
  {
    text: t('sendersBankAccount'),
    role: 'text',
    key: 'buyerInn',
    id: ''
  },
  {
    text: t('recipientsBankAccount'),
    role: 'text',
    key: 'sellerInn',
    id: ''
  },
  {
    text: t('transactionNumber'),
    role: 'text',
    key: 'paymentCode',
    id: ''
  },
  {
    text: t('contract.action'),
    role: 'action',
    key: 'action',
    id: '',
    isVisible: (row: InvoicePageGetAllData) => {
      return !row.isApprove
    }
  }
])
const tableBody = ref()
const menuList = computed(() => {
  return [
    { id: 1, name: t('actions.edit') },
    { id: 2, name: t('approve') },
    { id: 3, name: t('tariffs.menu.delete') }
  ]
})

const handleMenuClick = async (data: any) => {
  switch (data.nameId) {
    case 1:
      router.push(`/payment/payment-in/update/${data.id}?orgId=${params.orgId}`)
      break
    case 2:
      await ApproveInvoice(data.id)
      await fetchList()
      break
    case 3:
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
    await DeleteInvoice(id)
    toast.success(t('tariffs.successfullyDeleted'))
    await fetchList()
  } catch (error) {
    console.error(error)
  }
}

const fetchList = async () => {
  try {
    isFetching.value = true
    const {
      data: { result }
    } = await InvoicePageGetAll({
      skip: currentPage.value,
      take: itemsPerPage.value,
      organizationId: params.orgId as string
    })
    tableBody.value = result.data
    totalNumber.value = result.total
  } catch (error) {
    console.error(error)
  } finally {
    isFetching.value = false
  }
}

onMounted(async () => {
  await fetchList()
})
</script>

<style scoped></style>
