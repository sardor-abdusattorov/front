<template>
  <sessions-table />
</template>

<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'
definePage({
  meta: {
    permission: PERMISSIONS.EVENTS
  }
})
</script>
