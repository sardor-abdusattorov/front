<template>
  <base-page-layout :title="t('halls.halls_title')" back to="/palaces" :is-loading="loading">
    <template #actions>
      <base-button :to="`/palaces/schemas/${route.params.id}/add?name=${route.query.name}`">{{
        t('actions.add')
      }}</base-button>
    </template>
    <template #filter>
      <v-card class="pa-4">
        <div class="v-row">
          <v-col cols="12" md="4">
            <base-input clearable v-model="filter.searchText" :placeholder="`${t('search')}...`"></base-input>
          </v-col>
        </div>
      </v-card>
    </template>
    <template #content>
      <base-table
        :table-header="tableHeader"
        :is-loading="loading"
        :menu-list="menuList"
        :table-body="palaces"
        @clickMenuHandler="handleMenuClick"
        :pagination="{
          page: filter.skip + 1,
          total: Math.ceil(total ? total / filter.take : 0),
          pageClickHandler: (page: number) => {
            filter.skip = page - 1
          }
        }"
      ></base-table>
    </template>
  </base-page-layout>
  <teleport to="body">
    <delete-dialog v-model="isDelete" :id="selectedId" @removeElement="deletePalaceHall" />
  </teleport>
</template>

<script lang="ts" setup>
import { PalaceHallAllParams } from '@/services/palace/dto/palace.dto'
import { AllPalaceModel } from '@/services/palace/model/palace.model'
import { getPalaceHallPageGetAll, palaceHallDelete } from '@/services/palace/palace.service'
import { useEventsStore } from '@/stores/events.store'

import { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const { t } = useI18n()
const router = useRouter()
const route: any = useRoute()
const total = ref(0)
const loading = ref(false)
const isDelete = ref(false)
const selectedId = ref(0)

const palaces = ref<AllPalaceModel[]>([])
const filter = ref<PalaceHallAllParams>({
  palaceId: Number(route.params.id),
  searchText: '',
  skip: 0,
  take: 10
})

const store = useEventsStore()

const tableHeader = ref<TableHeaderTypes[]>([
  {
    id: 1,
    key: 'action',
    text: t('sold_tickets.table.action'),
    role: 'action'
  },
  {
    id: 2,
    key: 'name',
    text: t('halls.name'),
    role: 'text'
  },
  {
    id: 3,
    key: 'isActive',
    text: t('active'),
    role: 'checkbox'
  }
])

const menuList = ref<TableActionListType[]>([
  { id: 1, name: t('actions.edit') },
  { id: 2, name: t('actions.delete') },
  { id: 3, name: t('actions.view') }
])

const fetchAllPalaces = async () => {
  try {
    loading.value = true
    const { data } = await getPalaceHallPageGetAll(filter.value)
    palaces.value = data.result.data
    total.value = data.result.total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const deletePalaceHall = async () => {
  try {
    const { data } = await palaceHallDelete(selectedId.value)
    if (data.result.success) {
      toast.success(t('messages.deleted_success'))
      fetchAllPalaces()
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const handleMenuClick = ({ id, nameId }: { id: number; nameId: number }) => {
  switch (nameId) {
    case 1:
      router.push({
        name: '/palaces/schemas/[id]/edit',
        params: { id: route.params.id },
        query: { name: route.query.name, id }
      })
      break
    case 2:
      selectedId.value = id
      isDelete.value = true
      break
    case 3:
      router.push({
        name: '/palaces/schemas/[id]/view',
        params: { id: route.params.id },
        query: { name: route.query.name, id }
      })
      break
  }
}

watch([filter], fetchAllPalaces, { deep: true })

onMounted(() => {
  fetchAllPalaces()
  store.storedSvg = { svgText: '', svgJson: '' }
})
</script>
