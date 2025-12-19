<script setup lang="ts">
import { getOrderEvents } from '@/services/main/main.service'
import { OrderEvents } from '@/services/main/model/main.model'
import { TableHeaderTypes } from '@/types/table.types'
import { getErrorMessage } from '@/utils/functions'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const profitList = ref<OrderEvents[]>([])
const itemsPerPage = ref(5)
const currentPage = ref(0)
const totalNumber = ref(0)
const { t } = useI18n()

const emit = defineEmits(['hasLength'])

const loading = ref(false)

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('date'), key: 'utgan_vaqti', role: 'text', id: 1, render: (row: any) => {
      return row.utgan_vaqti ? dayjs(row.utgan_vaqti).format('HH:mm:ss  DD.MM.YYYY') : '-'
    }
  },
  { text: t('sold_tickets.table.palace'), key: 'palace_name', role: 'text', id: 2 },
  { text: t('sold_tickets.table.event'), key: 'event_name', role: 'text', id: 3 },
  { text: t('ticketCount'), key: 'count_ticket', role: 'text', id: 4 },
  { text: t('sum'), key: 'summa', role: 'text', id: 4 }
])

const fetchData = async () => {
  try {
    loading.value = true
    const {
      data: { result }
    } = await getOrderEvents({
      skip: currentPage.value,
      take: itemsPerPage.value
    })
    profitList.value = Array.isArray(result.list) ? result.list : []
    totalNumber.value = result.count
    emit('hasLength', profitList.value.length > 0)
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}
fetchData()
</script>

<template>
  <div class="main-table position-relative">
    <base-table :tableHeader="tableHeader" :tableBody="profitList" :is-loading="loading" :pagination="{
      page: 0,
      total: Math.ceil(totalNumber / itemsPerPage),
      pageClickHandler: (page: number) => {
        currentPage = page - 1
        fetchData()
      }
    }"></base-table>
    <base-spinner v-if="loading" position="absolute"></base-spinner>
  </div>
</template>

<style scoped>
.main-table {
  overflow: auto;
  min-height: 400px;
}
</style>
