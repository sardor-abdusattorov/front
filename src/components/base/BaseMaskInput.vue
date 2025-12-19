<script lang="ts" setup>
import { vMaska } from 'maska/vue'

// @ts-ignore
defineProps({
  args: {
    type: Object,
    default: () => ({})
  },
  disabled: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  rules: {
    type: Array as any,
    default: () => []
  },
  options: {
    type: Object,
    default: () => ({
      mask: '+(998) ## ###-##-##',
      eager: true
    })
  },
  isString: {
    type: Boolean,
    default: false
  }
})

const unmask = (value: string) => {
  if (value)
    return value.replace(/\D/g, '')
}

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="base-input">
    <label v-if="label" class="base-input__label">{{ label }}</label>

    <v-text-field v-bind:="args" v-maska="options" data-maska-reversed color="indigo" :rules="rules"
      :model-value="modelValue" :disabled="disabled" :label="placeholder" :hide-details="rules.length === 0"
      density="compact" @update:model-value="emit('update:modelValue', isString ? $event : unmask($event))" />
  </div>
</template>

<style lang="scss" scoped>
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
