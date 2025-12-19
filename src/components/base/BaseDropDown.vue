<template>
  <div class="dropdown" @click="toggleDropdown">
    <slot name="activator"></slot>

    <div v-if="isOpen" class="dropdown-list">
      <slot name="list"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ccc;
  width: 100%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  max-height: 400px;
  overflow-y: scroll;
}

.dropdown-list > * {
  padding: 12px 16px;
  cursor: pointer;
}
</style>
