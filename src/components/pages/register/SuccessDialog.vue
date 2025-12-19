<template>
  <v-dialog v-model="dialog" max-width="600" @after-leave="closeDialog">
    <v-card>
      <v-card-text class="text-center">
        <v-icon size="100" color="success">mdi-check-circle</v-icon>
        <h4 class="text-h4 mb-3">{{ t('contract.successfully') }}</h4>
        <div class="userData">
          <span>{{ t('contract.login') }}: {{ login }}</span>
          <span>{{ t('contract.password') }}: {{ password }}</span>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" @click="redirect">{{ t('contract.login') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  password: string
  login: string
}

defineProps<Props>()

const dialog = ref(false)
const { t } = useI18n()

const openDialog = () => {
  dialog.value = true
}

const closeDialog = () => {
  redirect()
}

const redirect = () => {
  window.location.href = '/login'
}

defineExpose({
  openDialog
})
</script>

<style scoped lang="scss">
.userData {
  margin-top: 20px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 12px;
  p {
    margin: 0;
  }
}
</style>
