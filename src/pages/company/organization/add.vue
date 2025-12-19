<template>
  <base-page-layout :title="t('organization.create')" :back="true">
    <template #content>
      <OrganizationUpdateForm />
    </template>
  </base-page-layout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PERMISSIONS } from '@/constants/permissions'

const { t } = useI18n()

definePage({
  meta: {
    permission: PERMISSIONS.ORGANIZATION
  }
})
</script>

<style scoped></style>
