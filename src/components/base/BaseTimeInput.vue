<template>
  <div class="custom-number-input">
    <label v-if="label">{{ label }}</label>
    <div class="custom-number-input__wrapper">
      <v-text-field
        :model-value="modelValue.hours"
        @update:model-value="emit('update:model-value', { hours: $event, minutes: modelValue.minutes })"
        placeholder="HH"
        density="compact"
        color="indigo"
        :rules="[rules.rulesHours]"
        v-maska="{
          mask: '##'
        }"
      />
      <span>:</span>
      <v-text-field
        :model-value="modelValue.minutes"
        @update:model-value="emit('update:model-value', { hours: modelValue.hours, minutes: $event })"
        placeholder="MM"
        density="compact"
        color="indigo"
        :rules="[rules.rulesMinutes]"
        v-maska="{
          mask: '##'
        }"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRules } from '@/utils/rules'
import { vMaska } from 'maska/vue'
defineProps<{ label?: string; modelValue: { hours: string; minutes: string } }>()
const rules = useRules()
const emit = defineEmits(['update:model-value'])
</script>

<style lang="scss">
.custom-number-input {
  position: relative;
  label {
    position: absolute;
    top: -20px;
    left: 0;
    font-size: 14px;
    color: #9e9e9e;
  }
  .v-number-input__control {
    display: none;
  }
  .v-field__append-inner {
    display: none;
  }
  &__wrapper {
    display: flex;
    align-items: flex-start;
    span {
      margin: 10px 15px 0;
      font-size: 18px;
    }
  }

  .v-input__details,
  input {
    width: 122px;
    text-align: center;
    padding-left: 5px;
    padding-right: 5px;
    margin: 0 auto;
  }
  .v-messages__message {
    font-size: 11px;
  }
}
</style>
