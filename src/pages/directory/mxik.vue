<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { PERMISSIONS } from '@/constants/permissions'
import MxikDialog from '@/components/pages/directory/MxikDialog.vue'
import {
  deleteMXIK,
  getAllMXIK,
  getAllSelected,
  getStructures,
  updateMXIK
} from '@/services/directory/directory.service'
import { TableHeaderTypes } from '@/types/table.types'

definePage({
  meta: {
    permission: PERMISSIONS.DICTIONARIES
  }
})

const { t } = useI18n()

const mxikRef = ref()
const dialogRef = ref()
const dataList = ref()
const structures = ref()
const mxik = ref('spic')
const loading = ref(false)
const language = ref('ru')
const selection = ref('selected')
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const searcName = ref<string>()
const searchIkpu = ref<string>()
const searchBarcode = ref<string>()
const totalNumber = ref<number>(0)
const tableKey = ref(0)

const actionItems = [
  {
    key: 'all',
    value: t('all')
  },
  {
    key: 'selected',
    value: t('directory.selected')
  }
]
const languages = [
  {
    text: t('lang.ru'),
    value: 'ru'
  },
  {
    text: t('lang.uz'),
    value: 'uz'
  }
]

const fetchData = async () => {
  loading.value = true
  try {
    if (selection.value == 'selected') {
      const {
        data: { result }
      } = await getAllSelected()
      dataList.value = result.slice(currentPage.value * 10, (currentPage.value + 1) * 10)
      totalNumber.value = result.length
    } else {
      const {
        data: { data, recordTotal }
      } = await getAllMXIK({
        lang: language.value ? language.value : 'ru',
        page: currentPage.value,
        size: itemsPerPage.value,
        type: 2,
        mxikCode: searchIkpu.value?.length === 17 ? searchIkpu.value : null,
        search_text: searcName.value ? searcName.value : null,
        shtrixCode: searchBarcode.value?.length === 13 ? searchBarcode.value : null
      })
      totalNumber.value = recordTotal
      dataList.value = data
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
  loading.value = false
}

const tableHeader = computed<TableHeaderTypes[]>(() => {
  const data: TableHeaderTypes[] = [
    {
      text: t('contract.action'),
      role: 'action',
      key: 'action',
      id: ''
    },

    {
      text: t('halls.name'),
      role: selection.value === 'selected' ? 'langText' : 'text',
      key: 'name',
      id: ''
    },
    {
      text: t('halls.description'),
      role: selection.value === 'selected' ? 'langText' : 'text',
      key: 'description',
      id: ''
    },
    {
      text: t('directory.ikpu'),
      role: 'text',
      key: mxik.value,
      id: ''
    },
    {
      text: t('directory.barcode'),
      role: 'text',
      key: 'internalCode',
      id: ''
    }
  ]

  if (selection.value == 'selected') {
    data.push({
      text: t('directory.selectedByDefault'),
      role: 'checkbox',
      key: 'isMain',
      id: ''
    })
  }

  return data
})

const getAllStructures = async () => {
  try {
    const {
      data: { result }
    } = await getStructures()
    structures.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const menuList = computed(() => {
  let data1 = [
    { id: 1, name: t('directory.viewPackages') },
    {
      id: 2,
      name: t('directory.selectByDefault'),
      isVisible(row: any) {
        return !row.isMain
      }
    },
    { id: 3, name: t('tariffs.menu.delete') }
  ]
  let data2 = [
    { id: 1, name: t('directory.viewPackages') },
    { id: 4, name: t('directory.select') }
  ]
  return selection.value == 'selected' ? data1 : data2
})

const handleMenuClick = async (item: any) => {
  if (item.nameId === 1) {
    dialogRef.value.open(item, language.value, selection.value)
  } else if (item.nameId === 2) {
    await updateMXIK({ ...item.item, isMain: true })
    await fetchData()
  } else if (item.nameId === 3) {
    await deleteMXIK(item.item.id)
    await fetchData()
  } else if (item.nameId === 4) {
    mxikRef.value.open(item, structures.value)
  }
}

watch(selection, (val) => {
  if (val == 'all') {
    mxik.value = 'mxik'
  }
  if (val == 'selected') {
    mxik.value = 'spic'
  }
  tableKey.value++
  currentPage.value = 0
  fetchData()
})
watch(searchIkpu, (val) => {
  if (val?.length == 17 || !val) {
    tableKey.value++
    currentPage.value = 0
    fetchData()
  }
})
watch(searchBarcode, (val) => {
  if (val?.length == 13 || !val) {
    tableKey.value++
    currentPage.value = 0
    fetchData()
  }
})
watch(searcName, () => {
  tableKey.value++
  currentPage.value = 0
  fetchData()
})
watch(language, () => {
  tableKey.value++
  currentPage.value = 0
  fetchData()
})
onMounted(async () => {
  await Promise.all([getAllStructures(), fetchData()])
})
</script>
<template>
  <base-page-layout :title="t('directory.mxik')" :isLoading="loading">
    <template #actions>
      <MxikDialog ref="dialogRef" />
      <AddMxik ref="mxikRef" />
      <v-col cols="12" sm="2" class="mt-1">
        <v-select :items="actionItems" item-title="value" item-value="key" v-model="selection" density="compact" />
      </v-col>
    </template>
    <template #filter v-if="selection == 'all'">
      <v-card class="py-3">
        <v-card-item>
          <v-row dense>
            <v-col cols="12" md="3">
              <BaseInput :label="t('directory.searchByName')" v-model="searcName" />
            </v-col>
            <v-col cols="12" md="3">
              <BaseMaskInput
                :options="{ mask: '#################' }"
                :label="t('directory.searchByIkpu')"
                v-model="searchIkpu"
              />
            </v-col>
            <v-col cols="12" md="3">
              <BaseMaskInput
                :options="{ mask: '#############' }"
                :label="t('directory.searchByBarcode')"
                v-model="searchBarcode"
              />
            </v-col>
            <v-col cols="12" md="3">
              <BaseSelect
                :label="t('lang.choose')"
                :items="languages"
                item-title="text"
                item-value="value"
                v-model="language"
              />
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
        :menu-list="menuList"
        :tableBody="dataList"
        @clickMenuHandler="handleMenuClick($event)"
      ></base-table>
    </template>
  </base-page-layout>
</template>
