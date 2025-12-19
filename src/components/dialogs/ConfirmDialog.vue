<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:model-value', $event)" width="400">
    <v-card>
      <template #text>
        <h3>{{ text }}</h3>
        <v-spacer class="my-4"></v-spacer>
        <div class="actions">
          <base-button color="red" @click="emit('update:model-value', false)">{{ t('actions.cancel') }} </base-button>
          <base-button color="primary" @click="confirmYes"> {{ t('yes') }} </base-button>
        </div>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
const props = defineProps<{ modelValue: boolean; id: number; text: string }>()
const emit = defineEmits(['update:model-value', 'confirm'])
const { t } = useI18n()

const confirmYes = () => {
  emit('confirm', props.id)
  emit('update:model-value', false)
}
</script>

<style lang="scss" scoped>
h3 {
  text-align: center;
  font-weight: 600;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
</style>
