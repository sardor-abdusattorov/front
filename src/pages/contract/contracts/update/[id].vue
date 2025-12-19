<template>
  <div>
    <base-title :title="t('contract.update_contract')" :back="true">
      <template #actions>
        <base-button @click="isDialogVisible = true">{{ t('contract.choose_main_doc') }}</base-button>
      </template>
    </base-title>
    <contract-add-edit-form
      :is-edit="true"
      :is-fond="userStore.isFond"
      :is-dialog-visible="isDialogVisible"
      @updateDialog="isDialogVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
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

const isDialogVisible = ref(false)
</script>
