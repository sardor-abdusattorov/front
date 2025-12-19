<template>
  <router-view />
</template>

<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'
definePage({
  meta: {
    permission: PERMISSIONS.PALACES
  }
})
</script>
