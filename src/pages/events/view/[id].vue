<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user.store'

definePage({
  meta: {
    permission: PERMISSIONS.EVENTS
  }
})

const route: any = useRoute()
const { t } = useI18n()
const userStore = useUserStore()
</script>

<template>
  <div>
    <div class="d-flex align-center justify-lg-space-between">
      <base-title :title="t('tickets.event')" :back="true" />
      <base-button v-if="userStore.isSuperUser" :to="`/events/sessions/${route.params.id}`">{{
        t('goToSession')
      }}</base-button>
    </div>

    <div class="add-form-drawer">
      <v-card class="card">
        <add-form :updateId="route.params.id" :isView="true" />
      </v-card>
    </div>
  </div>
</template>

<style scoped lang="css">
.card {
  padding: 24px 16px;
}
</style>
