<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { capitalize, getErrorMessage } from '@/utils/functions'
import { PERMISSIONS } from '@/constants/permissions'
import type { TableHeaderTypes } from '@/types/table.types'
import { deleteDistrict, getDistricts, getRegions } from '@/services/directory/directory.service'

const { t, locale } = useI18n()

definePage({
  meta: {
    permission: PERMISSIONS.DICTIONARIES
  }
})

const dialogRef = ref()
const regionList = ref()
const loading = ref(false)
const searchedRegion = ref()
const dataId = ref<number>()
const dataList = ref<any[]>([])
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const totalNumber = ref<number | undefined>(0)
const tableKey = ref(0)

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
    text: t('directory.region'),
    role: 'langText',
    key: 'regionName',
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
    } = await getDistricts({
      skip: currentPage.value,
      take: itemsPerPage.value,
      regionId: searchedRegion.value
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
    await deleteDistrict(id)
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
const getAllRegions = async () => {
  try {
    loading.value = true
    const {
      data: { result }
    } = await getRegions({ skip: 0, take: 100 })
    regionList.value = result.data
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

watch(searchedRegion, async () => {
  tableKey.value++
  currentPage.value = 0
  await fetchData()
})

onMounted(async () => {
  await getAllRegions()
  await fetchData()
})
</script>

<template>
  <base-page-layout :title="t('directory.district')" :isLoading="loading">
    <template #actions>
      <BaseButton @click="dialogRef.open()">{{ t('add') }}</BaseButton>
      <DistrictAddEditDialog ref="dialogRef" :regions="regionList" @update:data="fetchData" />
    </template>
    <template #filter>
      <v-card class="py-3">
        <v-card-item>
          <v-row>
            <v-col cols="24" md="4">
              <base-select
                v-if="regionList"
                :label="t('directory.region')"
                :items="regionList"
                :item-title="`name${capitalize(locale)}`"
                item-value="id"
                v-model="searchedRegion"
              ></base-select>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table
        :key="tableKey"
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

<style scoped></style>
