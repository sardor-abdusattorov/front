<template>
  <div class="card" draggable="true" @dragstart="emit('dragstartEvent', list)">
    <span>{{ store.currentColumnName(list) }}</span>
    <div>
      <v-btn density="compact" icon="mdi-cog-outline" class="mr-2" @click="dialogRef.open(list)" />
      <v-btn
        :icon="isDropdownOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        density="compact"
        @click="isDropdownOpen = !isDropdownOpen"
        class="mr-2"
        v-if="list.id !== 0"
      ></v-btn>

      <card-list-dropdown v-if="isDropdownOpen" @close="isDropdownOpen = false" :list="list" />
      <v-btn density="compact" icon="mdi-close" @click="store.removeColumn(list)"></v-btn>
      <column-update-dialog ref="dialogRef" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DynamicColumnModel } from '@/services/dynamic-reports/model/dynamic-reports.model'
import { useDynamicReportsStore } from '@/stores/dynamic-reports.store'
import ColumnUpdateDialog from '@/components/pages/reports/dynamic/ColumnUpdateDialog.vue'

defineProps<{ list: DynamicColumnModel; child?: boolean; parentId?: number }>()
const emit = defineEmits(['dragstartEvent', 'getFilterValues'])
const isDropdownOpen = ref(false)
const dialogRef = ref()

const store = useDynamicReportsStore()
</script>

<style lang="scss">
.card {
  width: 100%;
  padding: 10px 10px 10px 16px;
  outline: 1px solid rgba(223, 223, 223, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: 14px;
    line-height: 14px;
    font-weight: 500;
    user-select: none;
  }
}
.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  cursor: pointer;
}
</style>
