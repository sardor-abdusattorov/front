<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { PERMISSIONS } from '@/constants/permissions'
import type { TableHeaderTypes } from '@/types/table.types'
import { deleteRegion, getRegions } from '@/services/directory/directory.service'

const { t } = useI18n()

definePage({
  meta: {
    permission: PERMISSIONS.DICTIONARIES
  }
})

const dialogRef = ref()
const dataId = ref<number>()
const loading = ref(false)
const dataList = ref<any[]>([])
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const totalNumber = ref<number | undefined>(0)

const menuList = computed(() => {
  return [
    { id: 1, name: t('tariffs.menu.edit') },
    { id: 2, name: t('tariffs.menu.delete') }
  ]
})

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('contract.action'),
    role: 'action',
    key: 'action',
    id: ''
  },
  {
    text: t('halls.name'),
    role: 'langText',
    key: 'name',
    id: ''
  },
  {
    text: t('contract.comment'),
    role: 'langText',
    key: 'comment',
    id: ''
  }
])

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getRegions({
      skip: currentPage.value,
      take: itemsPerPage.value
    })
    dataList.value = data
    totalNumber.value = total
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
  loading.value = false
}

const deleteHandler = async (id: number) => {
  try {
    await deleteRegion(id)
    toast.success(t('successDeleted'))
    await fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const handleMenuClick = (item: any) => {
  if (item.nameId === 1) {
    dataId.value = item.id
    dialogRef.value.open(item.item)
  } else if (item.nameId === 2) {
    deleteHandler(item.id)
  }
}

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <base-page-layout :title="t('directory.region')" :isLoading="loading">
    <template #actions>
      <BaseButton @click="dialogRef.open()">{{ t('add') }}</BaseButton>
      <RegionAddEditDialog ref="dialogRef" @update:data="fetchData" />
    </template>
    <template #content>
      <base-table
        :tableHeader="tableHeader"
        :is-loading="loading"
        :pagination="{
          page: 0,
          total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchData()
          }
        }"
        :tableBody="dataList"
        :menu-list="menuList"
        @clickMenuHandler="handleMenuClick"
      ></base-table>
    </template>
  </base-page-layout>
</template>
