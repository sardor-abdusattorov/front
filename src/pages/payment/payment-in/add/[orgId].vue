<template>
  <base-page-layout :title="t('add')">
    <template #content>
      <PaymentAddUpdateForm :org-id="params.orgId" />
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
const params = route.params as { orgId: string }
</script>

<style scoped></style>
