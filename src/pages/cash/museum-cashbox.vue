<template>
  <v-card>
    <cashbox-header />
    <select-rate />
  </v-card>
  <base-spinner v-if="cashierStore.loading" />
</template>

<script lang="ts" setup>
import { toast } from 'vue3-toastify'

import { useUserStore } from '@/stores/user.store'
import { useCashierStore } from '@/stores/cashier.store'
import { PERMISSIONS } from '@/constants/permissions'

definePage({
  meta: {
    permission: PERMISSIONS.CASH_SOLD_TICKETS
  }
})

const userStore = useUserStore()
const cashierStore = useCashierStore()

const { loadData } = cashierStore

onMounted(async () => {
  await userStore.getUser()
  if (userStore.user?.organizationId) {
    await loadData(userStore.user.organizationId)
  } else {
    toast.error('Organization ID not found')
  }
})
</script>
