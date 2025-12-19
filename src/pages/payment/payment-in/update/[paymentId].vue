<template>
  <base-page-layout :title="t('tariffs.menu.edit')">
    <template #content>
      <PaymentAddUpdateForm :is-edit="true" :payment-id="params.paymentId" :org-id="route.query.orgId" />
    </template>
  </base-page-layout>
</template>

<script setup lang="ts">
import { PERMISSIONS } from '@/constants/permissions'
import { useI18n } from 'vue-i18n'

definePage({
  meta: {
    permission: PERMISSIONS.ORGANIZATION
  }
})

const { t } = useI18n()
const route = useRoute()
const params = route.params as { paymentId: string }
</script>

<style scoped></style>
