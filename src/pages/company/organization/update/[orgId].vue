<template>
  <base-page-layout :title="t('organization.update')" :back="true">
    <template #content>
      <OrganizationUpdateForm :is-edited="true" :org-id="params.orgId" />
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

interface RouteParams {
  orgId?: string
}

const { t } = useI18n()
const route = useRoute()
const params = route.params as RouteParams
</script>

<style scoped></style>
