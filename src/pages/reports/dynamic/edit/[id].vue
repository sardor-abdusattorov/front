<template>
  <create-update-reports :is-update="true" />
</template>

<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_FOND
  }
})
</script>
