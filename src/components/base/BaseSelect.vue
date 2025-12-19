<template>
  <div class="base-select">
    <label :name="name" v-if="label" class="base-select__label">{{ label }}</label>
    <component
      v-if="items"
      :is="items.length > 6 ? VAutocomplete : VSelect"
      v-bind="args"
      color="indigo"
      clearable
      :rules="rules"
      :label="placeholder"
      :items="items"
      :item-title="itemTitle ? itemTitle : 'text'"
      :item-value="itemValue ? itemValue : 'value'"
      :model-value="modelValue"
      :name="name"
      :multiple="multiple"
      :no-data-text="t('noData')"
      :density="density ?? 'compact'"
      :hide-details="!Array.isArray(rules)"
      :disabled="disabled"
      @update:model-value="$emit('update:modelValue', $event)"
      @click:clear="$emit('update:modelValue', undefined), $emit('click:clear')"
      @change="$emit('update:change', $event)"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { VAutocomplete, VSelect } from 'vuetify/components'

defineProps<{
  args?: any
  modelValue: any
  placeholder?: string
  label?: string
  items: any[]
  name?: string
  itemTitle?: string
  itemValue?: string
  multiple?: boolean
  density?: string
  rules?: any[]
  disabled?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'click:clear', 'update:change'])
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.base-select {
  &__label {
    font-size: 12px;
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 600;
    min-height: 21px;
  }
}
</style>
