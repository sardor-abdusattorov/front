<template>
  <div>
    <base-title :title="t('contract.create_template')" :back="true"> </base-title>
    <template-add-edit-form :is-fond="userStore.isFond" />
  </div>
</template>

<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user.store'

definePage({
  meta: {
    permission: PERMISSIONS.CONTRACTS
  }
})

const { t } = useI18n()
const userStore = useUserStore()
</script>
