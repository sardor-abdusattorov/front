<template>
  <div class="login-page" :style="{
    background: isDark ? '#121212' : '#fbf9fd'
  }">
    <UserKeyComponent v-if="activeStep === 0" @change-step="changeStep" />
    <ComapnyData v-else-if="activeStep === 1" />

    <img src="@/assets/images/top-pattern.png" class="login-page__img" :style="{ opacity: isDark ? 0.3 : 1 }" />
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')

const activeStep = ref(0)

const changeStep = (step: number) => {
  activeStep.value = step
}
</script>

<style lang="scss">
@import '@/styles/pages/login.scss';

.login-page {
  padding: 20px;

  .v-overlay__content {
    height: 400px;
  }
}

.key-list-trigger {
  display: flex;
  background: #fafbfc;
  height: 56px;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid #dfe2e9;
  border-radius: 6px;
  color: #7a889b;
  cursor: pointer;
  transition: 0.25s;
  margin-bottom: 5px;
  user-select: none;

  &:hover {
    color: #0096b2;
    border-color: #0096b2;
  }

  &--open {
    color: #0096b2;
    border-color: #0096b2;
  }

  &:hover {
    color: #0096b2;
    border-color: #0096b2;
  }

  &__icon {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }
}
</style>

<route lang="yaml">
meta:
  layout: auth
</route>
