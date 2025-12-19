<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:model-value', $event)" width="800">
    <v-card :title="t('schema.seat')">
      <template #text>
        <v-row>
          <v-col cols="12" md="4" class="d-flex flex-column justify-center ga-3">
            <base-input
              :model-value="dialogState.sector"
              @update:model-value="dialogState.sector = $event"
              :placeholder="t('schema.sector')"
            />
            <base-button class="mx-auto" @click="emit('save')">{{ t('schema.save_sector') }}</base-button>
          </v-col>
          <v-col cols="12" md="4" class="d-flex flex-column justify-center ga-3">
            <base-input
              :model-value="dialogState.row"
              @update:model-value="dialogState.row = $event"
              :placeholder="t('schema.row')"
            />
            <base-button class="mx-auto" @click="emit('save')">{{ t('schema.save_row') }}</base-button>
          </v-col>
          <v-col cols="12" md="4" class="d-flex flex-column justify-center ga-3">
            <base-input
              :model-value="dialogState.seat"
              @update:model-value="dialogState.seat = $event"
              :placeholder="t('schema.seat')"
            />
            <base-button class="mx-auto" @click="emit('save')">{{ t('schema.save_seat') }}</base-button>
          </v-col>
        </v-row>
        <p class="my-4 text-center">{{ t('schema.dialog_text') }}</p>
        <div class="d-flex align-center justify-center ga-4">
          <base-button
            @click="emit('positionClicked', true), emit('update:model-value', false)"
            >{{ t('schema.left_btn') }}</base-button
          >
          <base-button
            @click="emit('positionClicked', false), emit('update:model-value', false)"
            >{{ t('schema.right_btn') }}</base-button
          >
        </div>
      </template>

      <template v-slot:actions>
        <v-btn class="ms-auto" :text="t('actions.close')" @click="emit('update:model-value', false)"></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
withDefaults(
  defineProps<{
    modelValue: boolean
    dialogState: { row: string; seat: string; sector: string; id: string }
    isReversed: boolean
  }>(),
  {
    modelValue: false,
    dialogState: () => ({ row: '', seat: '', sector: '', id: '' })
  }
)
const emit = defineEmits(['update:model-value', 'save', 'positionClicked'])
const { t } = useI18n()
</script>
