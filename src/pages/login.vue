<template>
  <div
    class="login-page"
    :style="{
      background: isDark ? '#121212' : '#fbf9fd'
    }"
  >
    <v-form class="login-page__form" @submit.prevent="submitHandler" v-model="form">
      <img src="@/assets/images/new-logo.png" alt="logo" class="login-page__logo" />
      <v-card class="form--card" width="350px">
        <div class="form-top">{{ t('login.title') }}</div>
        <div class="form--card__block">
          <v-text-field
            autofocus
            :rules="[rules.required, rules.min]"
            :label="t('login.login')"
            type="text"
            density="compact"
            variant="underlined"
            v-model="model.login"
          />
          <v-text-field
            :rules="[rules.required, rules.min]"
            :label="t('login.password')"
            type="password"
            density="comfortable"
            variant="underlined"
            v-model="model.password"
          />
        </div>
        <v-btn
          type="submit"
          width="200px"
          height="40px"
          color="deep-purple-darken-1"
          rounded="xl"
          class="mx-auto d-block"
          :disabled="!form"
        >
          {{ t('login.submit') }}
        </v-btn>
        <div v-if="isCanReg" class="d-flex justify-center mt-3">
          <a href="/register" class="register-link">{{ t('register.title') }}</a>
        </div>
      </v-card>
    </v-form>
    <img src="@/assets/images/top-pattern.png" class="login-page__img" :style="{ opacity: isDark ? 0.3 : 1 }" />
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { useRules } from '@/utils/rules'
import { LoginDto } from '@/services/auth/dto/auth.dto'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from 'vue-i18n'
import { checkCanRegistration } from '@/services/agent/agent.service'

const rules = useRules()
const theme = useTheme()
const isDark = computed(() => theme.global.name.value === 'dark')
const store = useAuthStore()

const { t } = useI18n()

const isCanReg = ref(false)
const model = ref<LoginDto>({
  login: '',
  password: '',
  client_id: '12345'
})

const form = ref(false)

const submitHandler = () => {
  if (!form) return
  store.login(model.value)
}

const checkForReg = async () => {
  const {data: { result }} = await checkCanRegistration()

  if(result.path === 'FALSE') {
    isCanReg.value = false
  } else {
    isCanReg.value = true
  }
}

onMounted(async() => {
  await Promise.all([checkForReg()])
})
</script>

<style lang="scss">
@import '@/styles/pages/login.scss';
</style>

<route lang="yaml">
meta:
  layout: auth
</route>
