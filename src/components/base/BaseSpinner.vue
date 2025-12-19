<template>
  <div
    class="text-center overlay"
    :style="position === 'absolute' && 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)'"
  >
    <v-progress-circular class="progress-circ" indeterminate></v-progress-circular>
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{ overlay?: boolean; position?: 'fixed' | 'absolute' }>(), {
  overlay: false,
  position: 'fixed'
})
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  top: 64px;
  left: 255px;

  height: calc(100dvh - 64px);
  width: calc(100dvw - 255px);
  background-color: rgba(255, 255, 255, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: hidden;
  @media (max-width: 1280px) {
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
  }
}

body.dark-theme {
  .overlay {
    background-color: rgba(66, 66, 66, 0.5);
  }

  .progress-circ {
    color: #fff
  }
}

.progress-circ {
  color: #7e57c2
}

</style>
