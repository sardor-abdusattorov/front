<template>
  <v-dialog v-model="isOpen" width="500">
    <v-card class="pa-4">
      <base-input v-model="data.nameUz" :label="t('halls.nameUz')" class="mb-4" />
      <base-input v-model="data.nameRu" :label="t('halls.nameRu')" class="mb-4" />
      <base-input v-model="data.nameEn" :label="t('halls.nameEn')" class="mb-4" />
      <v-textarea rows="1" v-model="data.descriptionUz" :label="t('halls.descriptionUz')" class="mb-3" />
      <v-textarea rows="1" v-model="data.descriptionRu" :label="t('halls.descriptionRu')" class="mb-3" />
      <v-textarea rows="1" v-model="data.descriptionEn" :label="t('halls.descriptionEn')" class="mb-3" />
      <base-button color="primary" @click="save">{{ t('actions.save') }}</base-button>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { updateColumn, updateTable } from '@/services/dynamic-reports/dynamic-reports.service'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'

const props = withDefaults(defineProps<{ tableUpdate?: boolean }>(), {
  tableUpdate: false
})

const emit = defineEmits(['updated'])

const { t } = useI18n()
const data = ref()
const isOpen = ref(false)

const open = async (list: any) => {
  isOpen.value = true
  data.value = list
}

const save = async () => {
  try {
    const payload = {
      nameUz: data.value.nameUz,
      nameRu: data.value.nameRu,
      nameEn: data.value.nameEn,
      descriptionUz: data.value.descriptionUz,
      descriptionRu: data.value.descriptionRu,
      descriptionEn: data.value.descriptionEn,
      id: data.value.id
    }
    const { data: responseData } = props.tableUpdate ? await updateTable(payload) : await updateColumn(payload)

    if (responseData.result.success) {
      toast.success(t('messages.updated_success'))
      isOpen.value = false
      emit('updated')
    }
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

defineExpose({ open })
</script>

<style scoped></style>
