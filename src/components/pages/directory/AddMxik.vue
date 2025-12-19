<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { useRules } from '@/utils/rules'
import { capitalize, getErrorMessage } from '@/utils/functions'
import { addMXIK } from '@/services/directory/directory.service'

const rules = useRules()
const { t, locale } = useI18n()

const item = ref()
const form = ref()
const struct = ref()
const submitLoading = ref(false)
const structures = ref()
const isOpen = ref(false)
const isDefault = ref(false)

const open = async (data: any, structure: any) => {
  struct.value = null
  isDefault.value = false
  structures.value = structure
  isOpen.value = true
  item.value = data
}

const submit = async () => {
  const validate = await form.value.validate()
  if (validate && validate.valid) {
    submitLoading.value = true
    try {
      delete item.value.item.createdAt
      delete item.value.item.updateAt
      const spic = item.value.item.mxik
      delete item.value.item.mxik
      const updatedItem = {
        ...item.value.item,
        spic: spic
      }
      await addMXIK({
        ...updatedItem,
        isMain: isDefault.value,
        structureId: struct.value
      })
      isOpen.value = false
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      submitLoading.value = false
    }
  }
}

defineExpose({ open })
</script>

<template>
  <v-dialog v-model="isOpen" max-width="450">
    <v-form ref="form" @submit.prevent="submit">
      <v-card>
        <v-card-item>
          <v-card-title class="mb-5">
            {{ t('directory.selectStructure') }}
          </v-card-title>
          <BaseSelect
            :items="structures"
            v-model="struct"
            item-value="value"
            :item-title="`name${capitalize(locale)}`"
            :rules="[rules.required]"
          />
          <v-checkbox-btn :label="t('directory.selectByDefault')" v-model="isDefault" />
          <v-divider />
          <div class="d-flex align-end mt-4 justify-end ga-3">
            <BaseButton @click="isOpen = false" color="grey">{{ t('actions.cancel') }}</BaseButton>
            <BaseButton :loading="submitLoading" type="submit">{{ t('actions.save') }}</BaseButton>
          </div>
        </v-card-item>
      </v-card>
    </v-form>
  </v-dialog>
</template>
