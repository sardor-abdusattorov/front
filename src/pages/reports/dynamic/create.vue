<template>
  <create-update-reports />
</template>
<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_FOND
  }
})
</script>
