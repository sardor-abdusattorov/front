<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { useRules } from '@/utils/rules'
import { getErrorMessage } from '@/utils/functions'
import { AgeLimitDto } from '@/services/directory/dto/age-limit.dto'
import { createAgeLimit, updateAgeLimit } from '@/services/directory/directory.service'

const { t } = useI18n()
const rules = useRules()
const emit = defineEmits(['update:data'])

const FORM: AgeLimitDto = {
  name: '',
  comment: '',
  nameUz: '',
  nameRu: '',
  nameEn: '',
  nameQr: '',
  commentUz: '',
  commentRu: '',
  commentEn: '',
  commentQr: '',
}

const form = ref(FORM)
const dialog = ref(false)
const submitLoading = ref(false)
const submitFormRef = ref()
const id = ref<undefined | number>()

const resetForm = () => {
  id.value = undefined
  form.value = { ...FORM }
}

const submit = async () => {
  const validate = await submitFormRef.value.validate()
  if (validate && validate.valid) {
    try {
      submitLoading.value = true
      if (form.value.id) {
        await updateAgeLimit(form.value)
      } else {
        await createAgeLimit({
          name: form.value.name,
          comment: form.value.comment,
          nameEn: form.value.nameEn,
          nameUz: form.value.nameUz,
          nameRu: form.value.nameRu,
          nameQr: form.value.nameQr,
          commentEn: form.value.commentEn,
          commentUz: form.value.commentUz,
          commentRu: form.value.commentRu,
          commentQr: form.value.commentQr,
        })
      }
      dialog.value = false
      emit('update:data')
      submitFormRef.value.reset()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      submitLoading.value = false
    }
  }
}

const open = (data: AgeLimitDto) => {
  dialog.value = true
  if (data) {
    form.value = data
    id.value = data.id
  } else {
    resetForm()
  }
}

defineExpose({ open })
</script>

<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-form ref="submitFormRef" @submit.prevent="submit">
      <v-card :title="id ? t('tariffs.menu.edit') : t('add')">
        <v-card-text>
          <v-row dense>
            <v-col>
              <v-text-field v-model="form.nameUz" :rules="[rules.required]" :label="`${$t('halls.name')} (Uz)`" />
            </v-col>
            <v-col>
              <v-text-field v-model="form.nameEn" :rules="[rules.required]" :label="`${$t('halls.name')} (En)`" />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-text-field v-model="form.nameRu" :rules="[rules.required]" :label="`${$t('halls.name')} (Ru)`" />
            </v-col>
            <v-col>
              <v-text-field v-model="form.nameQr" :rules="[rules.required]" :label="`${$t('halls.name')} (Qr)`" />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-textarea v-model="form.commentUz" :label="`${$t('contract.comment')} (Uz)`" />
            </v-col>
            <v-col>
              <v-textarea v-model="form.commentEn" :label="`${$t('contract.comment')} (En)`" />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-textarea v-model="form.commentRu" :label="`${$t('contract.comment')} (Ru)`" />
            </v-col>
            <v-col>
              <v-textarea v-model="form.commentQr" :label="`${$t('contract.comment')} (Qr)`" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <div class="d-flex justify-end ga-2 my-4 pr-6">
          <v-spacer></v-spacer>
          <base-button color="red" @click="dialog = false">{{ t('close') }}</base-button>
          <base-button :loading="submitLoading" type="submit">
            {{ id ? t('tariffs.menu.edit') : t('add') }}</base-button>
        </div>
      </v-card>
    </v-form>
  </v-dialog>
</template>
