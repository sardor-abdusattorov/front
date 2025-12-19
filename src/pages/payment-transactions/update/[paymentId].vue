<template>
  <base-page-layout :title="t('tariffs.menu.edit')">
    <template #content>
      <AccountantUpdateForm :is-edit="true" :payment-id="Number(params.paymentId)" />
    </template>
  </base-page-layout>
</template>

<script setup lang="ts">
import { PERMISSIONS } from '@/constants/permissions'
import { useI18n } from 'vue-i18n'

definePage({
  meta: {
    permission: PERMISSIONS.PAYMENT_TRANSACTION
  }
})

const { t } = useI18n()
const route = useRoute()
const params = route.params as { paymentId: string }
</script>

<style scoped></style>
