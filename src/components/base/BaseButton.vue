<template>
  <v-btn color="primary" class="mb-1" v-bind="args"><slot /></v-btn>
</template>

<script lang="ts" setup>
defineProps<{ args?: any }>()
</script>

<style lang="scss" scoped>
.v-btn {
  color: white !important;
}
.bg-default {
  color: black !important;
}
body.dark-theme .bg-default{
  background: rgba(66,66,66);
  color: white !important;
}
</style>
