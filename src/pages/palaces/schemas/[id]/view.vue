<template>
  <base-title :title="t('halls.halls_view')" back />
  <base-spinner v-if="loading" />
  <v-card class="pa-4" v-else>
    <p class="mb-2">
      <strong>{{ t('sold_tickets.table.palace') }}</strong
      >: {{ route.query.name }}
    </p>
    <p class="mb-2">
      <strong>{{ t('halls.name') }}</strong
      >: {{ palaceHall?.name }}
    </p>
    <p class="mb-2">
      <strong>{{ t('active') }}</strong
      >: {{ palaceHall?.isActive ? t('yes') : t('no') }}
    </p>
    <p class="mb-2">
      <strong style="color: rgb(142, 36, 170)">{{ t('halls.svg') }}</strong>
    </p>
    <div v-html="palaceHall?.svgText" class="w-100" />
    <base-button class="mt-4" color="red" @click="router.go(-1)">{{ t('back') }}</base-button>
  </v-card>
</template>

<script lang="ts" setup>
import { PalaceHallModel } from '@/services/palace/model/palace.model'
import { getPalaceHallById } from '@/services/palace/palace.service'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const palaceHall = ref<PalaceHallModel | null>(null)
const route: any = useRoute()
const router = useRouter()
const loading = ref(false)
const { t } = useI18n()

const fetchPalaceHall = async () => {
  try {
    loading.value = true
    const { data } = await getPalaceHallById(Number(route.query.id))
    palaceHall.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

fetchPalaceHall()
</script>
