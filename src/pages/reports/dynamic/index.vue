<template>
  <base-page-layout :title="t('reports.dynamic')" :isLoading="loading">
    <template #actions>
      <base-button to="/reports/dynamic/create" v-if="tables.length > 0">{{ t('actions.create') }}</base-button>
    </template>
    <template #filter>
      <v-card class="pa-3">
        <v-row>
          <v-col cols="12" md="3">
            <base-input v-model="filter.name" :placeholder="t('search')" clearable />
          </v-col>
          <v-col cols="12" md="3">
            <base-date-input :placeholder="t('createdDate')" v-model="filter.createdAt" />
          </v-col>
          <v-col cols="12" md="3">
            <base-select
              v-model="filter.structureId"
              :items="structures"
              :item-title="`name${capitalize(locale)}`"
              item-value="value"
              :placeholder="t('contract.structure')"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <base-select
              v-model="filterSelects"
              @update:model-value="updateFiterValues"
              :items="tableHeader.slice(-4)"
              item-title="text"
              item-value="id"
              :placeholder="t('user.roles')"
              clearable
              multiple
            />
          </v-col>
        </v-row>
      </v-card>
    </template>
    <template #content>
      <base-table
        :is-loading="loading"
        :table-header="tableHeader"
        :table-body="tables"
        :menu-list="menuList"
        @click-menu-handler="handleMenuClick"
        :pagination="{
          page: 0,
          total: Math.ceil(total ? total / itemsPerPage : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchDynamicTables()
          }
        }"
        v-if="tables.length > 0"
      ></base-table>

      <v-card class="pa-4 dynamic-card" v-else-if="!loading && tables.length === 0">
        <div class="dynamic-card--content">
          <DynamicIcon />
          <p class="dynamic-card--text">{{ t('reports.create_dynamic_report') }}</p>
          <base-button to="/reports/dynamic/create">{{ t('actions.create') }}</base-button>
        </div>
      </v-card>
    </template>
  </base-page-layout>
</template>

<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'
import DynamicIcon from '@/assets/icons/dynamic.svg'

import { useI18n } from 'vue-i18n'
import {
  activateReportTemplate,
  deactivateReportTemplate,
  deleteReportTemplate,
  getReportTemplates
} from '@/services/dynamic-reports/dynamic-reports.service'
import { toast } from 'vue3-toastify'
import { getErrorMessage, currentLocale, capitalize } from '@/utils/functions'
import { DynamicTableModel } from '@/services/dynamic-reports/model/dynamic-reports.model'
import { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { getStructures } from '@/services/directory/directory.service'

const { t, locale } = useI18n()
const router = useRouter()
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const total = ref<number>(0)
const tables = ref<DynamicTableModel[]>([])
const loading = ref(false)
const structures = ref<any[]>([])
const filterSelects = ref([])

const filter = ref<any>({
  name: '',
  createdAt: null,
  structureId: null,
  isAdmin: null,
  isCashier: null,
  isAccountant: null,
  isActive: null
})

const tableHeader = ref<TableHeaderTypes[]>([
  { id: 1, key: 'id', text: t('contract.action'), role: 'action' },
  { id: 2, key: `name${currentLocale()}`, text: t('halls.name'), role: 'text' },
  { id: 3, key: `description${currentLocale()}`, text: t('halls.description'), role: 'text' },
  {
    id: 4,
    key: `structureName${currentLocale()}`,
    text: t('contract.structure'),
    role: 'text'
  },
  { id: 5, key: 'createdBy', text: t('createdBy'), role: 'text' },
  { id: 6, key: 'createdAt', text: t('createdDate'), role: 'dataTime' },
  { id: 7, key: 'updatedBy', text: t('updatedBy'), role: 'text' },
  { id: 8, key: 'updatedAt', text: t('updatedAt'), role: 'dataTime' },
  { id: 9, key: 'isAdmin', text: t('for_admin'), role: 'checkbox' },
  { id: 10, key: 'isCashier', text: t('for_cashier'), role: 'checkbox' },
  { id: 11, key: 'isAccountant', text: t('for_accountant'), role: 'checkbox' },
  { id: 12, key: 'isActive', text: t('active'), role: 'checkbox' }
])

const menuList: TableActionListType[] = [
  {
    name: t('actions.view'),
    icon: 'mdi-eye-outline',
    id: 1
  },
  {
    name: t('actions.edit'),
    icon: 'mdi-pencil-outline',
    id: 2
  },
  {
    name: t('activate'),
    icon: 'mdi-check',
    isVisible: (row: { isActive: boolean }) => !row.isActive,
    id: 3
  },
  {
    name: t('deactivate'),
    icon: 'mdi-close',
    isVisible: (row: { isActive: boolean }) => row.isActive,
    id: 4
  },
  {
    name: t('actions.delete'),
    icon: 'mdi-delete-outline',
    id: 5
  }
]

const updateFiterValues = (value: number[]) => {
  filter.value.isAdmin = value.includes(9) ? true : null
  filter.value.isCashier = value.includes(10) ? true : null
  filter.value.isAccountant = value.includes(11) ? true : null
  filter.value.isActive = value.includes(12) ? true : null
}

const handleMenuClick = (item: { nameId: number; id: number }) => {
  switch (item.nameId) {
    case 1:
      router.push(`/reports/dynamic/view/${item.id}`)
      break
    case 2:
      router.push(`/reports/dynamic/edit/${item.id}`)
      break
    case 3:
      activateReportTemplateById(item.id)
      break
    case 4:
      diactivateReportTemplateById(item.id)
      break
    case 5:
      deleteReportTemplateById(item.id)
      break
  }
}

const activateReportTemplateById = async (id: number) => {
  try {
    await activateReportTemplate(id)
    await fetchDynamicTables()
    toast.success(t('activate_success'))
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const diactivateReportTemplateById = async (id: number) => {
  try {
    await deactivateReportTemplate(id)
    await fetchDynamicTables()
    toast.success(t('deactivate_success'))
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const deleteReportTemplateById = async (id: number) => {
  try {
    await deleteReportTemplate(id)
    await fetchDynamicTables()
    toast.success(t('successDeleted'))
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const getAllStructures = async () => {
  try {
    const { data } = await getStructures()
    structures.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const fetchDynamicTables = async () => {
  try {
    loading.value = true
    const { data } = await getReportTemplates({ skip: currentPage.value, take: itemsPerPage.value, ...filter.value })
    tables.value = data.result.data
    total.value = data.result.count
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_FOND
  }
})

watch([filter], fetchDynamicTables, { deep: true })

onMounted(async () => {
  await Promise.all([fetchDynamicTables(), getAllStructures()])
})
</script>

<style lang="scss" scoped>
.dynamic-card {
  min-height: calc(100vh - 180px);
  display: flex;
  justify-content: center;
  align-items: center;
  &--content {
    max-width: 295px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 26px;
    text-align: center;
    svg {
      margin: 0 auto;
    }
    a {
      width: fit-content;
      margin: 0 auto;
    }
  }

  &--text {
    font-size: 24px;
    line-height: 29px;
    font-weight: 600;
  }
}
</style>
