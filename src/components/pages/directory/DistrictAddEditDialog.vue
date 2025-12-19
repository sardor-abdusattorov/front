<script setup lang="ts">
import { capitalize } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { useRules } from '@/utils/rules'
import { getErrorMessage } from '@/utils/functions'
import { createDistrict, updateDistrict } from '@/services/directory/directory.service'

const { t, locale } = useI18n()
const rules = useRules()
const emit = defineEmits(['update:data'])

const FORM = {
  id: null,
  name: '',
  regionId: '',
  nameUz: '',
  nameRu: '',
  nameEn: '',
  nameQr: '',
}

defineProps<{ regions?: { comment: string; name: string; id: number }[] }>()
const submitFormRef = ref()
const form = ref(FORM)
const submitLoading = ref(false)
const id = ref()
const dialog = ref(false)

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
        await updateDistrict(form.value)
      } else {
        await createDistrict({
          name: form.value.nameRu,
          nameEn: form.value.nameEn,
          nameUz: form.value.nameUz,
          nameRu: form.value.nameRu,
          nameQr: form.value.nameQr,
          regionId: form.value.regionId
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

const open = (data: any) => {
  dialog.value = true
  if (data) {
    id.value = data.id
    form.value = { ...data }
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
              <v-select v-model="form.regionId" :items="regions" :item-title="`name${capitalize(locale)}`"
                item-value="id" :rules="[rules.required]" :label="$t('directory.region')" />
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
