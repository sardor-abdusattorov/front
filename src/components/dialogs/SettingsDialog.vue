<template>
  <v-dialog max-width="500" :model-value="modelValue" @update:model-value="emit('update:model-value', $event)">
    <v-card :title="t('settings')">
      <v-card-item>
        <v-row no-gutters>
          <v-col cols="12">
            <v-select
              item-title="text"
              item-value="value"
              color="indigo"
              :label="t('theme.choose')"
              :model-value="selectedTheme"
              :items="themes"
              @update:modelValue="updateTheme"
            ></v-select>
          </v-col>
          <v-col cols="12">
            <v-select
              item-title="text"
              item-value="value"
              color="indigo"
              :label="t('lang.choose')"
              :model-value="selectedLang"
              :items="langs"
              @update:modelValue="updateLang"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-item>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn variant="tonal" color="indigo" @click="closeModelHandler">{{ t('close') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:model-value'])

const { t, locale } = useI18n()
const theme = useTheme()

const closeModelHandler = () => {
  emit('update:model-value', false)
}

const selectedTheme = ref(localStorage.getItem('theme'))
const selectedLang = ref(localStorage.getItem('lang'))

const themes = computed(() => [
  { text: t('theme.light'), value: 'light' },
  { text: t('theme.dark'), value: 'dark' }
])

const langs = computed(() => [
  { text: t('lang.ru'), value: 'ru' },
  { text: t('lang.uz'), value: 'uz' },
  { text: t('lang.en'), value: 'en' }
])

const updateTheme = (thm: string) => {
  selectedTheme.value = thm
  theme.global.name.value = thm
  localStorage.setItem('theme', thm)
  checkTheme()
}


onMounted(() => {
  checkTheme()
})

const checkTheme = () => {
  if (selectedTheme.value === 'dark') {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }
}

const updateLang = (lang: string) => {
  selectedLang.value = lang
  locale.value = lang
  localStorage.setItem('lang', lang)
  window.location.reload()
}
</script>
