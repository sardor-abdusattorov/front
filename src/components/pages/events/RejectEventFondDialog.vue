<template>
  <v-dialog v-model="isModalOpen" width="700">
    <v-form ref="submitFormRef" @submit.prevent="submit">
      <v-card>
        <div class="rounded d-flex flex-column ga-4">
          <div class="pt-4 px-4 modal-header d-flex align-center justify-lg-space-between">
            <div>{{ t('writeReasonCancel') }}</div>
            <v-icon icon="mdi-close"></v-icon>
          </div>

          <v-divider></v-divider>

          <div class="px-4 modal-body d-flex ga-2 text-sm-body-2">
            <v-textarea
              :rules="[rules.required]"
              v-model="rejectCause"
              rows="3"
              :placeholder="t('writeHere')"
            ></v-textarea>
          </div>

          <v-divider></v-divider>

          <div class="px-4 pb-4 d-flex align-center ga-4 justify-end">
            <v-btn :loading="isLoading" type="submit" class="rounded-xl" color="primary">{{ t('send') }}</v-btn>
          </div>
        </div>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { useRules } from '@/utils/rules'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { rejectEventByFond } from '@/services/events/events.service'
const emit = defineEmits(['update'])

const { t } = useI18n()

const rules = useRules()
const isLoading = ref(false)
const isModalOpen = ref(false)
const rejectCause = ref('')
const eventId = ref()
const submitFormRef = ref()

const openModal = (id: number) => {
  eventId.value = id
  isModalOpen.value = true
}

const submit = async () => {
  isLoading.value = true
  try {
    await rejectEventByFond({ eventId: eventId.value, rejectReason: rejectCause.value })
    isModalOpen.value = false
    toast.success(t('contract.successfully'))
    emit('update')
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  openModal
})
</script>
