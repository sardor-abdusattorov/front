<template>
  <v-card-item>
    <v-card-title class="pb-3">
      <base-title :title="t('cash.event')" />
    </v-card-title>
    <v-card-actions class="cash-custom">
      <button
        class="cash-custom__button"
        v-for="(item, index) in eventList"
        :key="index"
        :class="{ active: activeIndex === index }"
        @click="handleActionSelect(index, item.eventId)"
      >
        {{ item.eventName }}
      </button>
    </v-card-actions>
    <v-divider style="margin: 1rem 0" />
  </v-card-item>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCashierStore } from '@/stores/cashier.store'
import { useI18n } from 'vue-i18n'

const store = useCashierStore()

const { eventList } = storeToRefs(store)
const { selectAction } = store

const activeIndex = ref<number>(0)
const { t } = useI18n()

const handleActionSelect = (index: number, eventId: number) => {
  if (activeIndex.value === index) return
  activeIndex.value = index
  localStorage.setItem('activeIndex', index.toString())
  selectAction(eventId)
}

onMounted(() => {
  const storedIndex = localStorage.getItem('activeIndex')
  if (storedIndex) {
    activeIndex.value = parseInt(storedIndex, 10)
  }
})

onUnmounted(() => {
  localStorage.removeItem('activeIndex')
})
</script>
