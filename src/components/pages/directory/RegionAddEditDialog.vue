<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { useRules } from '@/utils/rules'
import { getErrorMessage } from '@/utils/functions'
import { createRegion, updateRegion, getCountries } from '@/services/directory/directory.service'
import { capitalize } from '@/utils/functions'

const { t, locale } = useI18n()
const rules = useRules()
const emit = defineEmits(['update:data'])

const FORM = {
  id: null,
  name: '',
  comment: '',
  countryId: null,
  nameUz: '',
  nameRu: '',
  nameEn: '',
  nameQr: '',
  commentUz: '',
  commentRu: '',
  commentEn: '',
  commentQr: ''
}

const id = ref()
const form = ref(FORM)
const dialog = ref(false)
const countryList = ref([])
const submitFormRef = ref()
const submitLoading = ref(false)

const fetchCountryList = async () => {
  try {
    const {
      data: { result }
    } = await getCountries()
    countryList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

onMounted(() => {
  fetchCountryList()
})

const resetForm = () => {
  id.value = undefined
  form.value = { ...FORM }
}

const submit = async () => {
  const validate = await submitFormRef.value.validate()
  if (validate && validate.valid) {
    try {
      submitLoading.value = true
      if (form.value.id && form.value.countryId) {
        await updateRegion(form.value)
      } else {
        await createRegion({
          nameEn: form.value.nameEn,
          nameRu: form.value.nameRu,
          nameUz: form.value.nameUz,
          name: form.value.nameRu,
          nameQr: form.value.nameQr,
          commentQr: form.value.commentQr,
          commentEn: form.value.commentEn,
          commentRu: form.value.commentRu,
          commentUz: form.value.commentUz,
          comment: form.value.commentRu,
          countryId: form.value.countryId!
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

const open = (data?: any) => {
  if (data) {
    form.value = data
    id.value = data.id
  } else {
    resetForm()
  }
  dialog.value = true
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
              <base-select v-model="form.countryId" :items="countryList" :item-title="`name${capitalize(locale)}`"
                item-value="id" :rules="[rules.required]" :label="$t('country')" />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-textarea rows="3" max-rows="5" v-model="form.commentUz" :label="`${$t('contract.comment')} (Uz)`" />
            </v-col>
            <v-col>
              <v-textarea rows="3" max-rows="5" v-model="form.commentEn" :label="`${$t('contract.comment')} (En)`" />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <v-textarea rows="3" max-rows="5" v-model="form.commentRu" :label="`${$t('contract.comment')} (Ru)`" />
            </v-col>
            <v-col>
              <v-textarea rows="3" max-rows="5" v-model="form.commentQr" :label="`${$t('contract.comment')} (Qr)`" />
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
