<script lang="ts" setup>
import { ESignKey } from '@shohrux_saidov/eimzo-client'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
const props = defineProps<{
  item: ESignKey
}>()

const isKeyValid = computed(() => {
  return dayjs(props.item.validTo).isAfter(dayjs())
})

defineEmits(['select'])

const { t } = useI18n()
</script>

<template>
  <VCard
    class="key-wrapper profile relative"
    :class="{ invalid: !isKeyValid }"
    @click="
      () => {
        isKeyValid ? $emit('select') : null
      }
    "
  >
    <div class="profile__header mb-4">
      <h3
        v-if="item.O && item.O.toUpperCase() !== 'НЕ УКАЗАНО' && item.O.toUpperCase() !== 'ЯККА ТАРТИБДАГИ ТАДБИРКОР'"
        class="profile__title"
      >
        {{ item.O }}
      </h3>
      <h3 v-else class="profile__title">
        {{ item.CN }}
      </h3>
    </div>
    <div class="profile-tag mt-4 -ml-0.5 font-medium">
      <div class="profile-tag__item" v-if="item.TIN">
        <p class="profile-tag__label">{{ t('user.inn') }}:</p>
        <p class="profile-tag__value ml-1">
          {{ item.TIN }}
        </p>
      </div>
    </div>
  </VCard>
</template>

<style lang="scss" scoped>
.key-wrapper {
  width: 100%;
  padding: 20px;
  border-bottom: 1px solid #dfe2e9;

  &.invalid {
    z-index: 1;
    position: relative;
    cursor: not-allowed !important;
    user-select: none;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.7);
      z-index: 1;
      pointer-events: none;
    }

    .invalid-text {
      position: relative;
      z-index: 2;
      opacity: 1 !important;
      background: rgba(255, 255, 255, 1) !important;
    }
  }
}

.profile {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__title {
    font-family: 'Rubik', sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 17px;
    letter-spacing: 0em;
    text-align: left;
  }

  &__type {
    font-family: 'Rubik', sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
    color: #1b60e1;

    &--organization {
      color: #2ab279;
    }
  }
}

.profile-tag {
  display: flex;
  column-gap: 12px;
  flex-wrap: wrap;

  &__item {
    padding: 6px;
    border-radius: 6px;
    display: flex;
  }
  &__label {
    color: #0096b2;
  }

}

.label-organization {
  font-family: 'Rubik', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  color: #989dba;
  display: flex;
  align-items: center;
  gap: 4px;
}

.value-organization {
  font-family: Rubik;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #000000;
  margin-left: 5px;
}

.value-certificate {
  font-family: Rubik;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #0096b2;
  margin-left: 5px;
}
</style>
