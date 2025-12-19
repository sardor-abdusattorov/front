<template>
  <base-page-layout :title="t('tariffs.title')" :back="back" :isLoading="isLoading" :remove-height="true">
    <template #actions>
      <div class="d-flex align-center ga-3">
        <slot name="actions"></slot>
        <base-button @click="isDialogOpen = true">{{ t('tariffs.add_tarif') }}</base-button>
      </div>
    </template>
    <template #content>
      <base-table
        :tableHeader="tableHeader"
        :tableBody="tariffsList"
        :is-loading="isLoading"
        :menuList="menuList"
        :pagination="{
          setCustomClass: true,
          page: 0,
          total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchTariffsList()
          }
        }"
        @click-menu-handler="handleClickMenu"
      >
        <template #action="{ row, index }">
          <tarif-position
            :firts-disabled="row.id === tariffsList[0].id"
            :last-disabled="row.id === tariffsList[tariffsList.length - 1].id"
            @close="isPositionOpen = false"
            @goUp="goPositionUp(row, index)"
            @goDown="goPositionDown(row, index)"
            v-if="isPositionOpen && selectedIndex === index"
          />
        </template>
      </base-table>
    </template>
  </base-page-layout>
  <teleport to="body">
    <add-edit-tarif-dialog
      v-model="isDialogOpen"
      :event-id="+route.params.id"
      :event-session-id="eventSessionId"
      :selected-tarif="selectedTarif"
      :is-edit="isEdit"
      @triggerLoadData="fetchTariffsList"
      @reset-form="resetForm"
    />
    <delete-dialog v-model="isDeleteDialogOpen" :id="selectedTarifId" @removeElement="removeTarifHandler" />
  </teleport>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { getEventSessionTarifs, getAllEventId, removeTarif, updatedTarifIndex } from '@/services/tarif/tarif.service'
import { TarifsIndexDto } from '@/services/tarif/dto/tarif.dto'
import { TarifsModel } from '@/services/cash/model'

import { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { getErrorMessage } from '@/utils/functions'

const props = withDefaults(defineProps<{ sessionId?: number; back?: boolean }>(), {
  back: true
})

const { t } = useI18n()
const route: any = useRoute()

const tariffsList = ref<TarifsModel[]>([])
const eventSessionId = ref<number | null>(null)
const isLoading = ref(false)
const totalNumber = ref<number | undefined>(0)
const currentPage = ref(0)
const isDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const isEdit = ref(false)
const selectedTarif = ref<TarifsModel>()
const selectedTarifId = ref<number>(0)
const isPositionOpen = ref(false)
const selectedIndex = ref(-1)

const tableHeader = ref<TableHeaderTypes[]>([
  {
    id: 4,
    text: t('tariffs.table.action'),
    role: 'action',
    key: 'action'
  },
  {
    id: 1,
    text: t('tariffs.table.name'),
    role: 'text',
    key: 'name'
  },
  {
    id: 2,
    text: t('tariffs.table.sum'),
    role: 'sum',
    key: 'price'
  },
  {
    id: 3,
    text: t('tariffs.table.color'),
    role: 'color',
    key: 'color'
  }
])

const menuList = ref<TableActionListType[]>([
  { id: 1, name: t('tariffs.menu.edit') },
  { id: 2, name: t('tariffs.menu.delete') },
  { id: 3, name: t('tariffs.menu.position') }
])

const handleClickMenu = (value: { id: number; nameId: number }) => {
  switch (value.nameId) {
    case 1:
      const index = tariffsList.value.findIndex((el) => el.id === value.id)
      selectedTarif.value = tariffsList.value[index]
      isEdit.value = true
      isDialogOpen.value = true
      break
    case 2:
      selectedTarifId.value = value.id
      isDeleteDialogOpen.value = true
      break
    case 3:
      selectedIndex.value = tariffsList.value.findIndex((el) => el.id === value.id)
      isPositionOpen.value = true
      break
  }
}

const removeTarifHandler = async (id: number) => {
  try {
    const { data } = await removeTarif(id)
    if (data.result.success) {
      toast.success(t('contract.successfully'))
      await fetchTariffsList()
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchGetAllEventId = async () => {
  if (props.sessionId) {
    eventSessionId.value = props.sessionId
    return
  }
  isLoading.value = true
  try {
    const { data } = await getAllEventId({ eventId: +route.params.id, skip: 0, take: 5 })
    eventSessionId.value = data.result.data[0].id
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const updateTarifList = async (payload: TarifsIndexDto[]) => {
  try {
    isLoading.value = true
    const { data } = await updatedTarifIndex(payload)
    if (data.result.success) {
      fetchTariffsList()
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const fetchTariffsList = async () => {
  if (!eventSessionId.value) return
  isLoading.value = true
  try {
    const { data } = await getEventSessionTarifs({
      eventSessionId: eventSessionId.value,
      skip: currentPage.value,
      take: 10
    })
    tariffsList.value = data.result.data
    totalNumber.value = data.result.total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const goPositionUp = async (row: TarifsModel, i: number) => {
  const index = tariffsList.value.indexOf(row)
  const payload = [
    { id: row.id, index: row.index - 1 },
    { id: tariffsList.value[index - 1].id, index: tariffsList.value[index - 1].index + 1 }
  ]
  await updateTarifList(payload)
  selectedIndex.value = index - 1
  isPositionOpen.value = true
}

const goPositionDown = async (row: TarifsModel, i: number) => {
  const index = tariffsList.value.indexOf(row) !== -1 ? tariffsList.value.indexOf(row) : i
  const payload = [
    { id: row.id, index: row.index + 1 },
    { id: tariffsList.value[index + 1].id, index: tariffsList.value[index + 1].index - 1 }
  ]
  await updateTarifList(payload)
  selectedIndex.value = index + 1
  isPositionOpen.value = true
}

const resetForm = () => {
  selectedTarif.value = undefined
  isEdit.value = false
}

onMounted(async () => {
  await fetchGetAllEventId()
  await fetchTariffsList()
})
</script>
