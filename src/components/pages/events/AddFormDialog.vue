<template>
  <div class="text-center pa-4">
    <v-dialog v-model="props.modelValue" persistent width="800">
      <v-card :title="t('events.ticktes_returns')">
        <v-card-text>
          <div class="wrapper" v-for="(fine, index) in fines" :key="index">
            <base-input
              density="comfortable"
              type="number"
              v-model="fine.hour"
              :rules="[rules.required]"
              :placeholder="t('events.hout_till_event')"
              :readonly="!fine.isUpdated"
              :disabled="isView"
            />
            <base-input
              density="comfortable"
              v-model="fine.percent"
              type="number"
              :rules="[rules.required]"
              :placeholder="t('events.fine_percent')"
              :readonly="!fine.isUpdated"
              :disabled="isView"
            />
            <div class="actions" v-if="!isView">
              <v-btn
                :color="fine.isUpdated ? 'green' : 'primary'"
                icon
                @click="updateFineField({ index, isUpdated: !fine.isUpdated, id: fine.id })"
              >
                <v-icon color="white">{{ fine.isUpdated ? ' mdi-check' : 'mdi-pencil' }}</v-icon>
              </v-btn>
              <v-btn color="red" icon @click="removeFineField({ index, id: fine.id })">
                <v-icon color="white">mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
          <div v-if="isView && !fines.length" class="pb-4">{{ t('no_fines') }}</div>
          <v-form ref="submitFormRef" @submit.prevent="addFields">
            <div class="wrapper" v-if="!isView">
              <base-input
                density="comfortable"
                type="number"
                v-model="form.hour"
                :rules="[rules.required]"
                :placeholder="t('events.hout_till_event')"
              />
              <base-input
                density="comfortable"
                v-model="form.percent"
                type="number"
                :rules="[rules.required]"
                :placeholder="t('events.fine_percent')"
              />
              <div class="status">{{ t('new') }}</div>
            </div>

            <v-divider></v-divider>
            <div class="d-flex my-4 justify-end mr-2 ga-3">
              <v-spacer></v-spacer>
              <base-button type="button" color="#999" @click="closeHandler">{{ t('close') }}</base-button>
              <base-button type="submit" :loading="submitLoading" v-if="!isView">{{ t('add') }}</base-button>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRules } from '@/utils/rules'
import { useEventsStore, FinesType } from '@/stores/events.store'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { createSingleTicketReject } from '@/services/events/events.service'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ modelValue: boolean; updateId?: string; isView?: boolean }>()
const emit = defineEmits(['update:modelValue', 'getFields'])
const rules = useRules()

const store = useEventsStore()
const { updateFineField, removeFineField } = store
const { fines } = storeToRefs(store)
const submitFormRef = ref()
const submitLoading = ref(false)
const { t } = useI18n()

const form = ref<FinesType>({
  hour: null,
  percent: null,
  isUpdated: false
})

const addFields = async () => {
  const validate = await submitFormRef.value.validate()
  if (validate && validate.valid) {
    if (props.updateId) {
      try {
        submitLoading.value = true
        const { data } = await createSingleTicketReject({
          eventId: +props.updateId!,
          hour: +form.value.hour!,
          percent: +form.value.percent!,
          submitTicketReject: true
        })
        if (data.result.success) {
          store.fetchRejectedTicketsById(+props.updateId!)
        }
      } catch (err) {
        toast(getErrorMessage(err))
      } finally {
        submitLoading.value = false
      }
    } else {
      fines.value.push({
        hour: form.value.hour,
        percent: form.value.percent,
        isUpdated: false
      })
    }
    submitFormRef.value.reset()
  }
}

const closeHandler = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 0.5fr;
  gap: 20px;

  .status {
    margin-top: 12px;
    text-align: center;
    font-size: 16px;
    color: #ff9800;
  }
  .actions {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
