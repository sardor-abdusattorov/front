<template>
  <div class="wrapper">
    <tariffs-table />
    <tariffs-instruction />
  </div>
</template>

<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'
definePage({
  meta: {
    permission: PERMISSIONS.EVENTS
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins.scss';
.wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  @include _1199-block {
    display: flex;

    flex-direction: column-reverse;
  }
}
</style>
