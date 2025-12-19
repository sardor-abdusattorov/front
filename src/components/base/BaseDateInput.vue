<template>
  <div class="base-date-input">
    <label :for="name" class="base-date-input__label" v-if="label">{{ label }}</label>
    <v-date-input v-bind="args" color="indigo" autocomplete="off" aria-autocomplete="none" clearable
      @update:model-value="handleUpdate($event)" @click:clear="handleClear" :hide-details="!Array.isArray(rules)"
      :disabled="disabled" :density="density" :model-value="modelValue" :name="name" :label="placeholder"
      :hide-actions="!multiple" :multiple="multiple === 'range' ? 'range' : false" :value="dateFormat"
      :ok-text="t('accept')" :cancel-text="t('cancel')" :rules="rules ?? []" :prepend-icon="prependIcon"
      :prepend-inner-icon="prependInnerIcon" :allowed-dates="allowedDates"></v-date-input>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { DATE_VIEW_FORMAT } from '@/constants/formats'
import { add5MoreHours } from '@/utils/functions'
import dayjs from 'dayjs'

const { t } = useI18n()

const props = defineProps({
  // @ts-ignore
  density: {
    type: String,
    default: 'compact'
  },
  args: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: [Date, Array, String, null],
    default: null,
    required: true
  },
  allowedDates: {
    type: Function,
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  multiple: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  rules: {
    type: [Array, null],
    default: null
  },
  prependIcon: {
    type: String,
    default: ''
  },

  prependInnerIcon: {
    type: String,
    default: 'mdi-calendar'
  }
})

const emit = defineEmits(['update:modelValue', 'update'])

const dateFormat = computed(() => {
  if (!props.modelValue) return null

  const singleDate = dayjs(props.modelValue).format(DATE_VIEW_FORMAT)

  const firstDate = dayjs(props.modelValue[0]).format(DATE_VIEW_FORMAT)
  const lastDate = dayjs(props.modelValue[props.modelValue.length - 1]).format(DATE_VIEW_FORMAT)
  const multipleDate = `${firstDate} - ${lastDate}`

  return props.multiple ? multipleDate : singleDate
})

const handleUpdate = (value: Date[] | Date) => {
  if (Array.isArray(value)) {
    const dates = {
      from: add5MoreHours(value[0]),
      to: add5MoreHours(value[value.length - 1])
    }

    emit('update', dates)
    emit('update:modelValue', value)
  } else {
    emit('update:modelValue', value)
  }
}
const handleClear = () => {
  if (props.multiple) {
    const from = dayjs().add(-1, 'day').toDate()
    const to = dayjs().add(0, 'day').toDate()
    emit('update:modelValue', [from, to])
    emit('update', { from, to })
  } else {
    emit('update:modelValue', null)
  }
}
</script>

<style lang="scss" scoped>
.base-date-input {
  &__label {
    font-size: 12px;
    display: block;
    min-height: 21px;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
}
</style>
