<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="text-center mt-6">
    <v-icon size="100" color="indigo">mdi-file-document-multiple-outline</v-icon>
    <p class="mt-4">{{ t('noData') }}</p>
  </div>
</template>

<style langs="scss"></style>
