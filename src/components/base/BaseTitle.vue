<template>
  <div class="page-title">
    <p class="page-title-text">
      <v-btn
        v-if="back"
        class="mr-2 mb-1"
        icon="mdi-keyboard-backspace"
        @click="to ? router.push(to) : router.go(-1)"
        density="comfortable"
      />
      {{ title }}
    </p>
    <slot name="actions"></slot>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ title?: string; back?: boolean; to?: string }>()

const router = useRouter()
</script>

<style lang="scss">
@import '@/styles/mixins.scss';

.page-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 16px;
  height: fit-content;
  @include _575-block {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 16px;
  }
}
.page-title-text {
  color: #2a3538;
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.29px;
  @include _575-block {
    font-size: 28px;
  }
}
body.dark-theme .page-title-text{
  color: #fff;
}
</style>
