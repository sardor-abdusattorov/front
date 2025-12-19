<template>
  <div v-if="loading" class="d-flex justify-center align-center" style="height: 100vh">
    <v-progress-circular color="#7e57c2" indeterminate />
  </div>
  <v-app v-else>
    <app-navigation v-model="userStore.isSidebarOpen" />

    <app-bar :open="userStore.isSidebarOpen" @update:open="userStore.isSidebarOpen = !userStore.isSidebarOpen" />
    <v-main
      class="app-main"
      :style="{
        background: isDark ? '#121212' : '#fbf9fd'
      }"
    >
      <div class="pa-4 position-relative app-main--page">
        <router-view />
      </div>

      <img class="top-pattern" src="@/assets/images/top-pattern.png" :style="{ opacity: isDark ? 0.3 : 1 }" />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store'
import { useDisplay, useTheme } from 'vuetify'
import { useCashierStore } from '@/stores/cashier.store'

const display = useDisplay()
const theme = useTheme()
const userStore = useUserStore()

const cashStore = useCashierStore()
const store = useUserStore()
const chechIsMobileScreen = () => {
  if (display.width.value < 1280) {
    userStore.isSidebarOpen = false
  }
}

const loading = ref(true)

const isDark = computed(() => theme.global.name.value === 'dark')

watch(() => display.width.value, chechIsMobileScreen)

onMounted(async () => {
  await userStore.getUser()
  chechIsMobileScreen()
  if (store.isTheatre) {
    await cashStore.getBooking()
  }
  setTimeout(() => {
    loading.value = false
  }, 1200)
})
</script>
