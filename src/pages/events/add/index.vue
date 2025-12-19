<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PERMISSIONS } from '@/constants/permissions'

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS
  }
})
const { t } = useI18n()

const router = useRouter()
</script>

<template>
  <div>
    <base-title :title="t('tickets.event')" :back="true" />
    <div class="add-form-drawer">
      <v-card>
        <add-form />
      </v-card>
    </div>
  </div>
</template>
