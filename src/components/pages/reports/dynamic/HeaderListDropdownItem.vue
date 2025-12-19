<template>
  <div v-click-outside="() => getCurrentIndex(-1)" class="header-list--item" :for="`${list.id}_${index}`">
    <p>{{ store.currentColumnName(list) }}</p>
    <div class="d-flex align-center ga-1">
      <v-checkbox-btn
        :id="`${list.id}_${index}`"
        class="checkbox"
        color="primary"
        v-model="isChecked"
        @update:model-value="store.insertColumn(list)"
      ></v-checkbox-btn>
      <template v-if="list.foreignTableId">
        <div class="arrow" @click="getCurrentIndex(index)">
          <v-icon color="primary" size="small" icon="mdi-chevron-right" />

          <div class="child-list" v-show="currentIndex === index">
            <header-list-dropdown-item
              v-for="child in childTable"
              :key="child.id"
              :list="child"
              :index="index"
              :child="true"
              :parentId="list.id"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getColumnByTableId } from '@/services/dynamic-reports/dynamic-reports.service'
import { DynamicColumnModel } from '@/services/dynamic-reports/model/dynamic-reports.model'
import { useDynamicReportsStore } from '@/stores/dynamic-reports.store'
import { getErrorMessage } from '@/utils/functions'
import { toast } from 'vue3-toastify'

const props = defineProps<{ list: DynamicColumnModel; index: number; child?: boolean; parentId?: number }>()
const currentIndex = ref(-1)

const getCurrentIndex = async (index: number) => {
  currentIndex.value = index

  if (currentIndex.value !== -1) {
    await fetchColumnByTableId()
  }
}
const isChecked = ref(false)
const store = useDynamicReportsStore()
const childTable = ref<DynamicColumnModel[]>([])

const fetchColumnByTableId = async () => {
  if (!props.list.foreignTableId) return
  try {
    const { data } = await getColumnByTableId(props.list.foreignTableId)
    childTable.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
</script>

<style lang="scss" scoped>
.header-list--item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  cursor: pointer;
  padding: 5px 5px 5px 16px;
  p {
    color: rgba(0, 29, 56, 1);
    font-size: 14px;
    line-height: 14px;
    font-weight: 500;
  }
  .checkbox {
    flex: unset;
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(221, 232, 237, 1);
  }
  .arrow {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: relative;
  }
}
.child-list {
  position: absolute;
  top: -5px;
  right: -305px;
  width: 100%;
  min-width: 300px;
  background-color: #fff;
  border: 1px solid #00c7c2;
  box-shadow: 0px 5px 20px 0px rgba(115, 134, 153, 0.25);
  border-radius: 6px;
  z-index: 50;
}

body.dark-theme .child-list {
  background: rgba(33, 33, 33) !important;
}
body.dark-theme .header-list--item p {
  color: white !important;
}
</style>
