<template>
  <v-card style="height: 250px; padding-top: 10px">
    <template v-slot:text>
      <v-form @submit.prevent="sendToEmail" v-model="form">
        <h2 class="text-center mb-4">Подтверждение електронная почта</h2>
        <div class="base-input">
          <label class="base-input__label" for="emailText">Билет будет отправляться в почту</label>
          <v-text-field
            v-model="emailText"
            :rules="[rules.emailRules, rules.required]"
            label="Ваша почта"
            color="indigo"
            type="email"
            density="compact"
            variant="filled"
            id="emailText"
          />
        </div>
        <v-card-actions class="d-flex justify-end px-0">
          <base-button color="red" variant="flat" type="button" @click="emit('close')">{{ t('cancel') }}</base-button>
          <base-button :loading="submitLoading" color="primary" variant="flat" type="submit">{{ t('ok') }}</base-button>
        </v-card-actions>
      </v-form>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
import { useRules } from '@/utils/rules'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const rules = useRules()

const form = ref(false)
const submitLoading = ref(false)

defineProps<{ ticketId: number }>()
const emit = defineEmits(['close'])

const emailText = ref(null)

const sendToEmail = async () => {
  if (!form.value) return
  console.log('hello')
}
</script>

<style lang="scss">
.base-input {
  &__label {
    font-size: 12px;
    display: block;
    min-height: 21px;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
}
</style>
