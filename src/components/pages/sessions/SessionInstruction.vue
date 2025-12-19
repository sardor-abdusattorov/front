<template>
  <div class="instruction">
    <h2>{{ t('tariffs.instruction.title') }}</h2>
    <div class="instruction__card">
      <p>{{ t('sessions.instruction.text') }}</p>
      <ol>
        <li>{{ t('sessions.instruction.list1') }}</li>
        <li>{{ t('sessions.instruction.list2') }}</li>
        <li>{{ t('sessions.instruction.list3') }}</li>
        <li>{{ t('sessions.instruction.list4') }}</li>
        <li>{{ t('sessions.instruction.list5') }}</li>
        <li>{{ t('sessions.instruction.list6') }}</li>
        <li>{{ t('sessions.instruction.list7') }}</li>
        <li>{{ t('sessions.instruction.list8') }}</li>
        <li>{{ t('sessions.instruction.list9') }}</li>
        <li>{{ t('sessions.instruction.list10') }}</li>
      </ol>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss">
.instruction {
  position: sticky;
  top: 0;
  height: fit-content;
  @media (max-width: 1199px) {
    position: static;
  }
  h2 {
    color: #2a3538;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.29px;
    margin-bottom: 8px;
  }
  &__card {
    padding: 16px;
    background: #fff;

    border-radius: 8px;
    p {
      font-size: 14px;
      line-height: 20px;
    }
    ol {
      padding-top: 8px;
      list-style-position: inside;
      padding-left: 24px;
      font-size: 14px;
      line-height: 20px;
      list-style: decimal;
    }
  }
}
body.dark-theme{
  .instruction{
    h2{
      color: #fff;
    }
    &__card{
      background: rgb(33,33,33);
    }
  }
}
</style>
