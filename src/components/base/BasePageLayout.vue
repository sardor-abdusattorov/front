<template>
  <div class="page-wrapper" :style="removeHeight ? 'height: auto' : 'height: calc(100vh - 96px)'">
    <base-title :title="title" :back="back" :to="to">
      <template #actions>
        <slot name="actions"></slot>
      </template>
    </base-title>
    <div class="page-filter">
      <slot name="filter" />
    </div>
    <div class="page-content" :style="removeHeight ? '' : 'flex: 1'">
      <slot name="content" />
    </div>
    <base-spinner v-if="isLoading" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{ title?: string; isLoading?: boolean; back?: boolean; removeHeight?: boolean; to?: string }>()
</script>

<style lang="scss">
@import '@/styles/mixins.scss';
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  @include _575-block {
    height: auto;
  }
  .page-filter {
    margin-bottom: 16px;
  }
  .page-content {
    overflow-y: auto;
  }
}
</style>
