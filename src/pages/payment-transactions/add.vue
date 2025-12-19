<template>
  <base-page-layout :title="t('add')">
    <template #content>
      <AccountantUpdateForm />
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
</script>

<style scoped></style>
