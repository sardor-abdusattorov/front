<template>
  <base-page-layout :title="t('user.userTurniket')" :isLoading="loading">
    <template #actions>
      <FormTurniketDialog ref="formDialog" @update:data="fetchData" />
    </template>
    <template #filter>
      <v-card class="py-3">
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-input clearable v-model="filter.search" :label="t('search')"
                :placeholder="t('search')"></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select :label="t('sold_tickets.table.palace')" :placeholder="t('sold_tickets.table.palace')"
                :item-title="`name${capitalize(locale)}`" :items="placeList" v-model="filter.palaceId"></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <base-select :label="t('report.statisticsTicket.activity')"
                :placeholder="t('report.statisticsTicket.activity')" :items="[
                  { text: t('active'), value: true },
                  { text: t('inactive'), value: false }
                ]" v-model="filter.status"></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table :key="tableKey" :tableHeader="tableHeader" :is-loading="loading" :pagination="{
        page: 0,
        total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
        pageClickHandler: (page: number) => {
          currentPage = page - 1
          fetchData()
        }
      }" :tableBody="tableBodyList" :menuList="menuList" @clickMenuHandler="handleMenuClick"></base-table>
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import type { TableHeaderTypes } from '@/types/table.types'
import { useI18n } from 'vue-i18n'
import {
  deleteTurniketUser,
  getPalaceListByFond,
  getTurniketUserList,
  updateTurniketActivate
} from '@/services/administration/admin.service'
import { AdminTurniketDto } from '@/services/administration/dto/admin.dto'
import { PERMISSIONS } from '@/constants/permissions'
import { toast } from 'vue3-toastify'
import { getErrorMessage, capitalize } from '@/utils/functions'

definePage({
  meta: {
    permission: PERMISSIONS.TURNIKET_ACCAUNT
  }
})

const { t, locale } = useI18n()
const tableBodyList = ref<AdminTurniketDto[]>([])
const placeList = ref<{ text: string; value: number }[]>([])
const totalNumber = ref<number | undefined>(0)
const loading = ref(false)
const currentPage = ref(0)
const itemsPerPage = ref(10)
const formDialog = ref()
const filter = ref({
  status: null,
  palaceId: null,
  search: null
})
const tableKey = ref(0)
const menuList = computed(() => {
  return [
    { id: 1, name: t('tariffs.menu.edit') },
    { id: 2, name: t('tariffs.menu.delete') },
    // { id: 3, name: t('report.statisticsTicket.activity') },
    { id: 3, name: t('deactivate'), isVisible: (row: TarifEventModel) => row.active },
    { id: 4, name: t('activate'), isVisible: (row: TarifEventModel) => !row.active },
  ]
})

const dataById = ref()
const handleMenuClick = (item: any) => {
  if (item.nameId === 1) {
    formDialog.value.open(item.id)
    dataById.value = item.id
  } else if (item.nameId === 2) {
    deleteHandler(item.id)
  } else if (item.nameId === 3) {
    updateActivate(item.id, false)
  }
  else if (item.nameId === 4) {
    updateActivate(item.id, true)
  }
}

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
    text: t('sold_tickets.table.palace'),
    role: 'text',
    key: 'palaceName',
    id: ''
  },
  {
    text: t('sold_tickets.table.palace_hall'),
    role: 'text',
    key: 'palaceHallNames',
    id: ''
  },
  {
    text: t('create_date'),
    role: 'date',
    key: 'createdDate',
    id: ''
  },

  {
    text: t('events.status'),
    role: 'status',
    key: 'active',
    id: ''
  }
])
const deleteHandler = async (id: number) => {
  try {
    await deleteTurniketUser(id)
    toast.success(t('successDeleted'))
    fetchData()
  } catch (error) {
    toast(getErrorMessage(error))
  }
}

const updateActivate = async (id: number, status: boolean) => {
  try {
    await updateTurniketActivate(id, status)
    toast.success(t('messages.updated_success'))
    fetchData()
  } catch (error) {
    toast(getErrorMessage(error))
  }
}
const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { data, total }
      }
    } = await getTurniketUserList({
      skip: currentPage.value,
      take: itemsPerPage.value,
      isActive: filter.value.status,
      palaceId: filter.value.palaceId,
      search: filter.value.search
    })
    tableBodyList.value = data
    totalNumber.value = total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}
const palaceListByFond = async () => {
  try {
    const {
      data: { result }
    } = await getPalaceListByFond({})
    placeList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

watch(
  [filter],
  () => {
    currentPage.value = 0
    tableKey.value++
    fetchData()
  },
  { deep: true }
)

onMounted(async () => {
  await Promise.all([fetchData(), palaceListByFond()])
})
</script>
