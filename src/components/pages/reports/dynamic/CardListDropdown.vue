<template>
  <div class="radios" v-click-outside="() => emit('close')">
    <template v-for="item in items.filter((i) => i.shouldRender)" :key="item.id">
      <label class="radios--wrapper">
        <div class="radios--item">
          <span>{{ item.name }}</span>
          <v-checkbox-btn
            hide-details
            color="primary"
            v-model="item.value"
            @update:model-value="changeHandler(item)"
          ></v-checkbox-btn>
        </div>
      </label>

      <div v-if="item.id === 1 && item.value" class="radios--list">
        <div class="radios--select" v-if="list.typeName === 'reference'">
          <div class="radios--select--header" @click="isSelectOpen = !isSelectOpen" :class="{ active: isSelectOpen }">
            <span>{{
              selectedFilterOption
                ? locale === 'ru'
                  ? selectedFilterOption.nameRu
                  : locale === 'uz'
                    ? selectedFilterOption.nameUz
                    : selectedFilterOption.nameEn
                : t('choose_type_filter')
            }}</span>
            <i :class="`mdi mdi-chevron-${isSelectOpen ? 'up' : 'down'}`"></i>
          </div>
          <div class="radios--options" v-if="isSelectOpen">
            <div
              class="radios--options--list"
              v-for="val in selects"
              :key="val.id"
              @click.prevent="changeSelectHandler(val)"
            >
              {{ locale === 'ru' ? val.nameRu : locale === 'uz' ? val.nameUz : val.nameEn || '' }}
            </div>
          </div>
        </div>
        <template v-if="list.typeName === 'String'">
          <form class="radios--form" @submit.prevent="handleFilterName">
            <input v-model="filterName" type="text" :placeholder="t('reports.filter_name')" />
            <button type="submit">{{ t('actions.add') }}</button>
          </form>
          <ul class="radios--ul">
            <li class="radios--li" v-for="val in filterValues" :key="val.id">
              <span>{{ val.name }}</span>
              <i @click.prevent="deleteFilter(val.id)" class="mdi mdi-close"></i>
            </li>
          </ul>
        </template>
        <base-date-input
          v-if="list.typeName === 'DateTime'"
          v-model="dateFilter"
          @update:model-value="updateDateHandler"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { getReferenceBookByTableId } from '@/services/dynamic-reports/dynamic-reports.service'
import { DynamicColumnModel } from '@/services/dynamic-reports/model/dynamic-reports.model'
import { useDynamicReportsStore } from '@/stores/dynamic-reports.store'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const emit = defineEmits(['close', 'getFilterValues'])
const props = defineProps<{ list: DynamicColumnModel }>()
const { t, locale } = useI18n()
interface Item {
  name: string
  id: number
  shouldRender: boolean
  value: boolean
}

const updateDateHandler = (val: any) => {
  dateFilter.value = val
  store.columnFilters.push({ filterInputType: val, columnId: props.list.id })
  store.selectedActions.push({
    actionId: 1,
    columnId: props.list.id,
    value: [val],
    order: store.selectedActions.length + 1
  })
}

type FilterSelect = { id: number; nameUz: string; nameRu: string; nameEn: string }

const selects = ref<FilterSelect[]>([])

const selectedFilterOption = ref<FilterSelect | null>(null)
const isSelectOpen = ref(false)
const dateFilter = ref(null)

const changeSelectHandler = (select: FilterSelect) => {
  selectedFilterOption.value = select
  store.columnFilters.push({ filterInputType: select.id, columnId: props.list.id })
  store.selectedActions.push({
    actionId: 1,
    columnId: props.list.id,
    value: [select.id],
    order: store.selectedActions.length + 1
  })
  isSelectOpen.value = false
}

const store = useDynamicReportsStore()
const filterValues = ref<{ name: string; id: number }[]>([])
const filterName = ref('')

const handleFilterName = () => {
  if (!filterName.value) return
  filterValues.value.push({ name: filterName.value, id: filterValues.value.length + 1 })
  filterName.value = ''

  const index = store.selectedActions.findIndex((item) => item.actionId === 1)
  store.selectedActions[index].value = filterValues.value.map((item) => item.name)
}

const deleteFilter = (id: number) => {
  filterValues.value = filterValues.value.filter((item) => item.id !== id)
}

const items = ref<Item[]>([
  { name: 'WHERE', id: 1, shouldRender: props.list.isFilterable!, value: false },
  { name: 'ORDER BY', id: 2, shouldRender: props.list.isOrderable!, value: false },
  { name: 'GROUP BY', id: 3, shouldRender: props.list.isGroupable!, value: false },
  { name: 'SUM', id: 4, shouldRender: props.list.isSummable!, value: false },
  { name: 'COUNT', id: 5, shouldRender: props.list.isCountable!, value: false },
  { name: 'DISTINCT', id: 6, shouldRender: props.list.isDistinct!, value: false }
])

const changeHandler = async (item: Item) => {
  if (item.value) {
    if (props.list.typeName === 'String') {
      store.selectedActions.push({
        order: store.selectedActions.length + 1,
        actionId: item.id,
        columnId: props.list.id,
        value: filterValues.value.map((item) => item.name)
      })
    }

    if (item.id === 1 && props.list.typeName === 'reference') fetchReferenceBookByColumnId()
  } else {
    store.selectedActions = store.selectedActions.filter(
      (action) => action.actionId !== item.id && action.columnId !== props.list.id
    )
  }
}

const fetchReferenceBookByColumnId = async () => {
  try {
    const { data } = await getReferenceBookByTableId(props.list.foreignTableId || props.list.tableId!)
    selects.value = data.result
  } catch (err) {
    toast.error(getErrorMessage(err))
  }
}

const checkIsChecked = () => {
  items.value.forEach((item) => {
    item.value = store.selectedActions.some(
      (action) => action.actionId === item.id && action.columnId === props.list.id
    )

    if (item.id === 1 && props.list.typeName === 'reference') fetchReferenceBookByColumnId()
  })
}
checkIsChecked()

onMounted(() => {
  const filterderActionIndex = store.selectedActions.findIndex(
    (item) => item.actionId === 1 && item.columnId === props.list.id
  )

  if (filterderActionIndex !== -1) {
    filterValues.value = store.selectedActions[filterderActionIndex].value
      ? store.selectedActions[filterderActionIndex].value.map((item: string) => ({
          name: item,
          id: filterValues.value.length + 1
        }))
      : []
  }
})
</script>

<style lang="scss" scoped>
body.dark-theme {
  .radios {
    background-color: rgb(33, 33, 33);

    &--item {
      label {
        color: #ffff;
      }
    }
  }
}

.radios {
  position: absolute;
  top: 50px;
  right: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #00c7c2;
  box-shadow: 0 5px 20px 0 rgba(115, 134, 153, 0.25);
  border-radius: 6px;
  z-index: 50;
  max-height: 400px;
  overflow-y: auto;
  .v-selection-control {
    flex: 0;
  }
  &--item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    width: 100%;
    cursor: pointer;
    padding: 3px 3px 3px 16px;

    label {
      width: 100%;
      text-align: right;
      font-size: 14px;
      line-height: 22px;
      font-weight: 500;
      color: rgba(0, 29, 56, 1);
      padding: 5px 0;
      cursor: pointer;
    }

    input {
      accent-color: #019f9c;
      cursor: pointer;
    }

    &:not(:last-child) {
      border-bottom: 1px solid rgba(221, 232, 237, 1);
    }
  }
  &--wrapper {
    display: flex;
    flex-direction: column;
  }
  &--list {
    padding: 5px;
    border-bottom: 1px solid rgba(221, 232, 237, 1);
  }
  &--form {
    display: flex;
    gap: 2px;
    margin-bottom: 5px;
    input {
      font-size: 14px;
      outline: none;
      border: 1px solid rgba(221, 232, 237, 1);
      padding: 5px 10px;
      flex: 1;
      border-radius: 5px;
    }
    button {
      background-color: #00c7c2;
      color: white;
      font-size: 14px;
      padding: 5px;
      border-radius: 5px;
    }
  }
  &--ul {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
  }

  &--li {
    background-color: #e1e1e1;
    color: black;
    padding: 7px 10px;
    display: flex;
    align-items: center;
    gap: 5px;
    border-radius: 20px;
    font-size: 14px;
    line-height: 1;
    i {
      cursor: pointer;
    }
  }
  &--select {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 5px 10px;
    border: 1px solid rgba(221, 232, 237, 1);
    border-radius: 6px;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;
    &--header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      &.active {
        border-bottom: 1px solid rgba(221, 232, 237, 1);
        padding-bottom: 5px;
      }
    }
  }
  &--options {
    display: flex;
    flex-direction: column;
    &--list {
      padding: 5px 10px;
      border-radius: 3px;
      &:not(:last-child) {
        border-bottom: 1px solid rgba(221, 232, 237, 1);
      }
      &:hover {
        background-color: #00c7c2;
        color: #fff;
      }
    }
  }
}
</style>
