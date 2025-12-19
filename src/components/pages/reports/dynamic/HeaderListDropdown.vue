<template>
  <div class="header-list" v-click-outside="() => emit('close')">
    <header-list-dropdown-item v-for="(list, index) in columnList" :key="list.id" :list="list" :index="index" />
  </div>
</template>

<script lang="ts" setup>
import { DynamicColumnModel } from '@/services/dynamic-reports/model/dynamic-reports.model'

defineProps<{ columnList: DynamicColumnModel[] }>()

const emit = defineEmits(['close'])
</script>

<style lang="scss">
.header-list {
  position: absolute;
  top: 40px;
  left: 0;
  max-width: 300px;
  width: 100%;
  background-color: #fff;
  border: 1px solid #00c7c2;
  box-shadow: 0px 5px 20px 0px rgba(115, 134, 153, 0.25);
  border-radius: 6px;
  z-index: 50;

  &-wrapper {
    position: relative;
    width: 100%;
  }
}
body.dark-theme .header-list {
  background: rgba(33, 33, 33) !important;
}
</style>
