<template>
  <span class="position">
    <v-btn
      icon="mdi-chevron-up"
      density="compact"
      color="primary"
      style="color: white !important"
      @click="emit('goUp')"
      :disabled="firtsDisabled"
    ></v-btn>
    <v-btn
      @click="emit('close')"
      icon="mdi-close"
      density="compact"
      color="red"
      style="color: white !important"
    ></v-btn>
    <v-btn
      @click="emit('goDown')"
      icon="mdi-chevron-down"
      density="compact"
      color="primary"
      style="color: white !important"
      :disabled="lastDisabled"
    ></v-btn>
  </span>
</template>

<script lang="ts" setup>
defineProps<{ firtsDisabled: boolean; lastDisabled: boolean }>()
const emit = defineEmits(['close', 'goUp', 'goDown'])
</script>

<style lang="scss" scoped>
.position {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 100px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  z-index: 10;
}
</style>
