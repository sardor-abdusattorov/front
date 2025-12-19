<template>
  <v-app-bar class="pl-4">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="emit('update:open', !open)" variant="elevated"></v-app-bar-nav-icon>
    </template>
    <template v-slot:append>
      <div class="d-flex align-center">
        <div class="pa-4 text-center">
          <v-dialog max-width="90vw">
            <!-- <template v-slot:activator="{ props: activatorProps }">
              <div v-bind="activatorProps" class="cursor-pointer text-h6 font-weight-regular d-sm-block d-none">
                {{ t('balance') }} {{ formatMoney(transactionsBalance?.get_org_saldo) }} (UZS)
              </div>
            </template> -->
            <template v-slot:default="{ isActive }">
              <transaction-list-dialog v-if="isActive" @close="isActive.value = false" />
            </template>
          </v-dialog>
        </div>
        <div
          v-if="userStore.user?.structureId === STRUCTURES.TOUR_AGENT"
          class="text-h6 font-weight-regular d-sm-block d-none"
        >
          {{ t('deposite') }} {{ formatMoney(userStore.depozitBalance) }} (UZS)
        </div>
        <div v-if="!isPhoneSize" class="d-flex ga-5 align-center ml-4">
          <transition mode="out-in">
            <v-icon
              v-if="selectedTheme == 'dark'"
              icon="mdi-white-balance-sunny"
              class="cursor-pointer"
              :title="t('theme.light')"
              @click="updateTheme('light')"
            ></v-icon>
            <v-icon
              v-else
              icon="mdi-weather-night"
              class="cursor-pointer"
              :title="t('theme.dark')"
              @click="updateTheme('dark')"
            ></v-icon>
          </transition>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props">
                <v-icon icon="mdi-translate" start></v-icon>
                <span v-for="item in languages" :key="item.value">
                  <span v-if="item.value == selectedLang">{{ item.text }}</span>
                </span>
              </v-btn>
            </template>
            <v-list>
              <v-list-item class="pa-0" v-for="(item, index) in languages" :key="index" :value="item.value">
                <span class=" pa-2 d-block" @click="updateLang(item.value)">{{ item.text }}</span>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn class="ma-2" style="" v-bind="props">
              <v-icon icon="mdi-account" start></v-icon>
              <span>{{ userStore.user?.login }}</span>
            </v-btn>
          </template>

          <v-list density="compact">
            <v-list-item v-if="isPhoneSize" value="settings" append-icon="mdi-cog" @click="isDialogOpen = true"
              >{{ t('settings') }}
            </v-list-item>

            <v-list-item value="settings" append-icon="mdi-logout" @click="authStore.logout()">
              {{ t('logout') }}
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </template>
  </v-app-bar>
  <settings-dialog :model-value="isDialogOpen" @update:model-value="updateDialogHandler" />
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { getTransactionBalance } from '@/services/transaction/transaction.service'
import { formatMoney, getErrorMessage } from '../utils/functions'

import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { useTheme } from 'vuetify'
import { STRUCTURES } from '@/constants/structures'
import { getClearingBalance } from '@/services/payment/payment.service'

const { t, locale } = useI18n()

defineProps({ open: Boolean })
const emit = defineEmits(['update:open'])
const authStore = useAuthStore()
const userStore = useUserStore()
const isDialogOpen = ref(false)
const route = useRoute()
const router = useRouter()
const theme = useTheme()

const isPhoneSize = ref(window.innerWidth < 670)
const selectedTheme = ref(localStorage.getItem('theme') || 'light')
const selectedLang = ref(localStorage.getItem('lang') || 'ru')

const transactionsBalance = ref()

watch(isDialogOpen, (newValue) => {
  const query = { ...route.query }
  if (newValue) {
    query.dialog = 'true'
  } else {
    delete query.dialog
  }
  router.replace({ query })
})
const handleResize = () => {
  isPhoneSize.value = window.innerWidth < 670
}

const updateDialogHandler = (value: boolean) => {
  isDialogOpen.value = value
}

const transactionBalance = async () => {
  try {
    const {
      data: { result }
    } = await getTransactionBalance()
    transactionsBalance.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const languages = computed(() => [
  { text: t('lang.ru'), value: 'ru' },
  { text: t('lang.uz'), value: 'uz' },
  { text: t('lang.en'), value: 'en' },
  { text: t('lang.qr'), value: 'qr' }
])

const updateTheme = (thm: string) => {
  selectedTheme.value = thm
  theme.global.name.value = thm
  localStorage.setItem('theme', thm)
  checkTheme()
}

const updateLang = (lang: string) => {
  console.log(lang)
  selectedLang.value = lang
  locale.value = lang
  localStorage.setItem('lang', lang)
  window.location.reload()
}

const checkTheme = () => {
  if (selectedTheme.value === 'dark') {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }
}

const fetchDepositeBalance = async () => {
  try {
    const { data } = await getClearingBalance()
    userStore.depozitBalance = data.result.balance
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  checkTheme()
  if (route.query.dialog === 'true') {
    isDialogOpen.value = true
  }
  transactionBalance()
  if (userStore.user?.structureId === STRUCTURES.TOUR_AGENT) {
    fetchDepositeBalance()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
