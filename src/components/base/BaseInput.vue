<template>
  <div class="base-input">
    <label v-if="label" :for="name" class="base-input__label">{{ label }}</label>
    <v-text-field
      v-bind="args"
      :model-value="modelValue"
      :name="name"
      :type="type"
      :append-icon="appendIcon"
      @update:model-value="$emit('update:modelValue', $event)"
      @click:append="$emit('click:append')"
      :label="placeholder"
      :readonly="readonly"
      :rules="rules"
      :hide-details="!Array.isArray(rules)"
      :disabled="disabled"
      :density="density ?? 'compact'"
      color="indigo"
      variant="filled"
      :clearable="clearable"
      :min="min"
      :max="max"
      :autocomplete="autocomplete"
    />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  type?: string
  args?: any
  modelValue: any
  placeholder?: string
  disabled?: boolean
  label?: string
  name?: string
  readonly?: boolean
  clearable?: boolean
  rules?: any
  density?: any
  appendIcon?: string
  min?: number
  max?: number
  autocomplete?: string
}>()
const emit = defineEmits(['update:modelValue', 'click:append'])
</script>

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
