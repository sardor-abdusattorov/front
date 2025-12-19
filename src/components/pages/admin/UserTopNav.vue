<template>
  <div class="custom-user">
    <div class="custom-user__card">
      <base-button variant="text" prepend-icon="mdi-account" to="/admin/users">
        {{ t('user.users') }}
      </base-button>
      <base-button variant="text" prepend-icon="mdi-scatter-plot" to="/admin/roles">
        {{ t('user.roles') }}
      </base-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.custom-user {
  position: relative;

  &__card {
    display: flex;
    gap: 20px;
    position: absolute;
    top: -10px;
    right: 15px;
    left: 15px;
    width: calc(100% - 30px);
    background-image: linear-gradient(to left, #0dcec9 0, #7e54c2 100%);
    border-radius: 3px;
    padding: 10px;
    z-index: 1;
  }
}
</style>
