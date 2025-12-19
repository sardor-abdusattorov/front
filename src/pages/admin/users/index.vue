<template>
  <base-page-layout :isLoading="loading">
    <template #filter>
      <user-top-nav />
      <v-card class="pt-9">
        <v-card-item>
          <v-row class="my-2">
            <v-col cols="12" md="3">
              <base-input
                clearable
                :label="t('search')"
                :placeholder="t('search')"
                v-model="filter.search"
              ></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select
                :items="[
                  { text: t('user.admin'), value: 'isAdmin' },
                  { text: t('user.cashier'), value: 'isKassir' }
                ]"
                v-model="filter.status"
                :label="t('contract.status')"
                :placeholder="t('contract.status')"
                outlined
              ></base-select>
            </v-col>
            <v-col class="d-flex ga-4 justify-end align-end" cols="12" md="6">
              <base-button to="users/form" color="primary" outlined> {{ t('contract.add') }}</base-button>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table
        :key="tableKey"
        :tableHeader="tableHeader"
        :tableBody="tableBodyList"
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
    </template>
  </base-page-layout>
</template>

<script setup lang="ts">
import type { TableHeaderTypes } from '@/types/table.types'
import { deleteUser, getUserList } from '@/services/administration/admin.service'
import { AdminDto } from '@/services/administration/dto/admin.dto'
import { PERMISSIONS } from '@/constants/permissions'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import { getErrorMessage } from '@/utils/functions'

definePage({
  meta: {
    permission: PERMISSIONS.USERS
  }
})
const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('contract.action'),
    role: 'action',
    key: 'action',
    id: ''
  },
  {
    text: t('user.login'),
    role: 'text',
    key: 'login',
    id: ''
  },
  {
    text: t('user.firstName'),
    role: 'text',
    key: 'firstName',
    id: ''
  },
  {
    text: t('user.lastName'),
    role: 'text',
    key: 'lastName',
    id: ''
  },
  {
    text: t('user.phone'),
    role: 'phone',
    key: 'telefon',
    id: ''
  },
  {
    text: t('active'),
    role: 'status',
    key: 'active',
    id: ''
  },
  {
    text: t('report.reportsTicket.cashier'),
    role: 'checkbox',
    key: 'isKassir',
    id: ''
  }
])
const menuList = ref([
  { id: 1, name: t('tariffs.menu.edit') },
  { id: 2, name: t('tariffs.menu.delete') }
])
const currentPage = ref(0)
const itemsPerPage = ref(10)
const tableKey = ref(0)

const handleMenuClick = (item: { nameId: number; id: number }) => {
  if (item.nameId === 1) {
    router.push(`/admin/users/edit/${item.id}`)
  } else if (item.nameId === 2) {
    handleDelete(item.id)
  }
}
const tableBodyList = ref<AdminDto[]>([])
const totalNumber = ref<number | undefined>(0)
const filter = ref({
  search: null,
  status: null
})

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { data, total }
      }
    } = await getUserList({
      skip: currentPage.value,
      take: itemsPerPage.value,
      search: filter.value.search,
      isKassir: filter.value.status === 'isKassir' ? true : null,
      isAdmin: filter.value.status === 'isAdmin' ? true : null
    })
    tableBodyList.value = data
    totalNumber.value = total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await deleteUser(id)
    toast.success(t('successDeleted'))
    fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

watch(
  [filter],
  () => {
    tableKey.value++
    currentPage.value = 0
    fetchData()
  },
  { deep: true }
)

fetchData()
</script>
