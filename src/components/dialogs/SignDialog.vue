<template>
  <v-dialog v-model="isModalOpen" width="700" persistent>
    <v-card class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center pa-0 mb-4">
        <span>{{ t('contract.menu.sign') }}</span>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <div v-if="isEimzoLoading" class="pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">{{ t('loading_keys') }}</p>
      </div>

      <div v-else-if="eimzoError" class="pa-4">
        <v-alert type="error" variant="tonal">
          <div class="font-weight-bold">{{ t('error_loading_keys') }}</div>
          <div class="text-sm mt-2">{{ eimzoError }}</div>
          <div class="text-sm mt-1">Убедитесь что USB токен подключен и E-IMZO установлен</div>
        </v-alert>
      </div>

      <div v-else>
        <!-- Предупреждение о старой версии E-IMZO -->
        <v-alert
          v-if="versionInfo?.isOldVersion && showVersionWarning"
          type="warning"
          variant="tonal"
          closable
          @click:close="showVersionWarning = false"
          class="mb-4"
        >
          <div class="d-flex flex-column ga-2">
            <div class="font-weight-bold">{{ t('old_eimzo_version') }}</div>
            <div class="text-sm">{{ t('old_eimzo_version_desc') }} (текущая версия: {{ versionInfo.version }})</div>
            <div class="d-flex ga-2 mt-2">
              <v-btn
                color="primary"
                size="small"
                variant="elevated"
                href="https://e-imzo.soliq.uz/"
                target="_blank"
              >
                {{ t('download_eimzo') }}
              </v-btn>
              <v-btn
                color="grey"
                size="small"
                variant="text"
                @click="showVersionWarning = false"
              >
                {{ t('continue_anyway') }}
              </v-btn>
            </div>
          </div>
        </v-alert>

        <!-- Информация о контракте -->
        <div class="mb-4">
          <div class="d-flex justify-space-between mb-3">
            <div><strong>{{ t('contractDate') }}:</strong> {{ signData?.contractEDSInfoModel?.endContractDate }}</div>
            <div><strong>{{ t('commission') }}:</strong> {{ signData?.contractEDSInfoModel?.percent }}</div>
          </div>

          <v-row dense>
            <v-col cols="6">
              <v-card variant="outlined" class="pa-3">
                <ul v-if="signData?.contractEDSInfoModel" class="contract-info-list">
                  <li>{{ signData.contractEDSInfoModel.firstOrgModel.name || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.firstOrgModel.tin || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.firstOrgModel.director || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.firstOrgModel.regNumberNds || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.firstOrgModel.mfo || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.firstOrgModel.phones || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.firstOrgModel.address || '-' }}</li>
                </ul>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card variant="outlined" class="pa-3">
                <ul v-if="signData?.contractEDSInfoModel" class="contract-info-list">
                  <li>{{ signData.contractEDSInfoModel.secondOrgModel.name || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.secondOrgModel.tin || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.secondOrgModel.director || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.secondOrgModel.regNumberNds || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.secondOrgModel.mfo || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.secondOrgModel.phones || '-' }}</li>
                  <li>{{ signData.contractEDSInfoModel.secondOrgModel.address || '-' }}</li>
                </ul>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Ошибка подписания -->
        <v-alert
          v-if="signError"
          type="error"
          variant="tonal"
          closable
          @click:close="signError = null"
          class="mb-4"
        >
          <div class="font-weight-bold">Ошибка при подписании</div>
          <div class="text-sm mt-2">{{ signError }}</div>
          <div class="text-sm mt-1">Попробуйте еще раз</div>
        </v-alert>

        <!-- Табы внизу -->
        <div :class="{ 'blocked-content': isSigningBlocked }">
          <v-tabs v-model="tab" bg-color="transparent" color="primary" class="mb-4" :disabled="isSigningBlocked">
            <v-tab value="token">{{ t('sign_with_token') }}</v-tab>
            <v-tab value="file">{{ t('sign_with_file') }}</v-tab>
          </v-tabs>

        <v-window v-model="tab" :touch="false" class="no-transition">
          <!-- Вкладка USB токен -->
          <v-window-item value="token">
            <v-card variant="outlined" class="pa-4">
              <base-select
                v-model="selectedUsbDevice"
                :label="t('select_usb_device')"
                :items="usbDevices"
                item-title="name"
                item-value="name"
                :placeholder="usbDevices.length === 0 ? t('no_usb_devices') : t('select_usb_device')"
                :disabled="usbDevices.length === 0 || isSigningBlocked"
                class="mb-4"
              >
                <template v-if="usbDevices.length === 0" #append>
                  <v-icon color="warning">mdi-alert-circle-outline</v-icon>
                </template>
              </base-select>

              <div class="d-flex justify-end">
                <base-button @click="signContractWithToken" :disabled="!selectedUsbDevice || isSigningBlocked">
                  {{ t('contract.menu.sign') }}
                </base-button>
              </div>
            </v-card>
          </v-window-item>

          <!-- Вкладка файл ключа -->
          <v-window-item value="file">
            <v-card variant="outlined" class="pa-4">
              <div v-if="correctEKey">
                <div class="mb-4 text-sm">
                  <div class="mb-2">
                    <span class="text-grey">{{ t('contracts.organization') }}:</span>
                    <span class="font-weight-bold ml-2">{{ correctEKey?.O }}</span>
                  </div>
                  <div>
                    <span class="text-grey">{{ t('user.inn') }}:</span>
                    <span class="font-weight-bold ml-2">{{ correctEKey?.TIN }}</span>
                  </div>
                </div>

                <div class="d-flex justify-end">
                  <base-button @click="signContract" :disabled="isSigningBlocked">
                    {{ t('contract.menu.sign') }}
                  </base-button>
                </div>
              </div>

              <v-alert v-else type="error" variant="tonal">
                {{ t('youDontHaveTrueSignKey') }}
              </v-alert>
            </v-card>
          </v-window-item>
        </v-window>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useEimzo } from '@/composables/useEimzo'
import { getContractSign, putContractSign } from '@/services/contracts/contracts.service'
import { ESignKey } from '@shohrux_saidov/eimzo-client'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { useUserStore } from '@/stores/user.store'
import { GetContractSignResult } from '@/services/contracts/model/contracts.model'
const { t } = useI18n()
const { eKeys, getHashESign, signWithToken, isLoading: isEimzoLoading, error: eimzoError, usbDevices, versionInfo, clearError } = useEimzo()
const userStore = useUserStore()
const emit = defineEmits(['update'])
const signData = ref<GetContractSignResult>()
const isModalOpen = ref(false)

const correctEKey = ref<ESignKey>()
const expectedTIN = ref<string>('')
const availableKeys = computed(() => eKeys.value.map((k: ESignKey) => k.TIN).join(', '))

// Выбор способа подписания: 'token' или 'file'
const tab = ref<'token' | 'file'>('token')
const tokenType = ref<'idcard' | 'baikey' | 'ckc'>('ckc')
const selectedUsbDevice = ref<string>('')

// Показывать предупреждение о версии
const showVersionWarning = ref(true)

// Блокировать подписание пока показывается предупреждение о версии
const isSigningBlocked = computed(() => {
  return versionInfo.value?.isOldVersion && showVersionWarning.value
})

// Ошибка подписания (отдельно от ошибки загрузки)
const signError = ref<string | null>(null)

// Автоматически выбираем первое устройство когда они загрузятся
watch(usbDevices, (devices) => {
  if (devices.length > 0 && !selectedUsbDevice.value) {
    selectedUsbDevice.value = devices[0].name
  }
}, { immediate: true })

// Закрытие диалога
const closeDialog = () => {
  isModalOpen.value = false
  // Сбрасываем ошибку при закрытии
  clearError()
}

const openModal = async (contractId: number) => {
  // Сбрасываем ошибки при открытии
  clearError()
  signError.value = null
  await fetchContractSign(contractId)
  isModalOpen.value = true
}

const fetchContractSign = async (contractId: number) => {
  try {
    const {
      data: { result }
    } = await getContractSign({
      contractId
    })

    // Функция для нормализации TIN (убираем пробелы, приводим к одному регистру)
    const normalizeTIN = (tin: string | null | undefined): string => {
      if (!tin) return ''
      return tin.toString().replace(/\s+/g, '').trim()
    }

    // Определяем нужный TIN в зависимости от того, какая организация подписывает
    if (result.contractEDSInfoModel.firstOrgModel.id === userStore.user?.organizationId) {
      expectedTIN.value = result?.contractEDSInfoModel?.firstOrgModel?.tin
      const normalizedExpectedTIN = normalizeTIN(expectedTIN.value)

      correctEKey.value = eKeys.value.find(
        (key: ESignKey) => normalizeTIN(key.TIN) === normalizedExpectedTIN
      )
    } else if (result.contractEDSInfoModel.secondOrgModel.id === userStore.user?.organizationId) {
      expectedTIN.value = result?.contractEDSInfoModel?.secondOrgModel?.tin
      const normalizedExpectedTIN = normalizeTIN(expectedTIN.value)

      correctEKey.value = eKeys.value.find(
        (key: ESignKey) => normalizeTIN(key.TIN) === normalizedExpectedTIN
      )
    }

    // ОТЛАДОЧНАЯ ИНФОРМАЦИЯ - посмотрим что происходит
    console.log('=== ОТЛАДКА ПОДПИСАНИЯ КОНТРАКТА ===')
    console.log('Ожидаемый TIN организации:', expectedTIN.value)
    console.log('ID вашей организации:', userStore.user?.organizationId)
    console.log('Первая организация:', result.contractEDSInfoModel.firstOrgModel)
    console.log('Вторая организация:', result.contractEDSInfoModel.secondOrgModel)
    console.log('Всего ключей на токене:', eKeys.value.length)
    console.log('Доступные ключи:', eKeys.value.map((k: ESignKey) => ({
      TIN: k.TIN,
      CN: k.CN,
      O: k.O
    })))
    console.log('Найден подходящий ключ:', correctEKey.value ? 'ДА' : 'НЕТ')
    if (correctEKey.value) {
      console.log('Выбранный ключ:', {
        TIN: correctEKey.value.TIN,
        CN: correctEKey.value.CN,
        O: correctEKey.value.O
      })
    }
    console.log('=====================================')

    signData.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

// Подписание через USB токен
const signContractWithToken = async () => {
  if (!signData.value) return

  // Сбрасываем предыдущую ошибку
  signError.value = null

  try {
    console.log('=== ПОДПИСАНИЕ ЧЕРЕЗ USB ТОКЕН ===')
    console.log('Выбранное устройство:', selectedUsbDevice.value)
    console.log('Тип токена:', tokenType.value)

    // Вызываем подписание через токен - появится окно ввода PIN-кода
    const myHash = await signWithToken(tokenType.value, signData.value.signToHash)

    if (!myHash?.hash) {
      signError.value = 'Не удалось создать подпись. Проверьте подключение USB токена.'
      return
    }

    // Для USB токена используем данные из контракта
    const orgModel = signData.value.contractEDSInfoModel.firstOrgModel.id === userStore.user?.organizationId
      ? signData.value.contractEDSInfoModel.firstOrgModel
      : signData.value.contractEDSInfoModel.secondOrgModel

    let model = {
      contractId: signData.value.contractEDSInfoModel.id,
      signToHash: myHash?.hash,
      organizationName: orgModel.name || '',
      fullName: orgModel.director || '',
      address: orgModel.address || ''
    }

    await putContractSign(model)
    toast.success(t('contract.successfully'))
    emit('update')
    isModalOpen.value = false
  } catch (e: any) {
    console.error('Ошибка при подписании через токен:', e)

    // Показываем ошибку в alert, а не в toast
    const errorMessage = e?.message || getErrorMessage(e)
    signError.value = errorMessage
  }
}

// Подписание через файл ключа
const signContract = async () => {
  if (!correctEKey.value || !signData.value) return

  // Сбрасываем предыдущую ошибку
  signError.value = null

  try {
    const myHash = await getHashESign(correctEKey.value, signData.value.signToHash)
    const pairs = correctEKey.value.alias.split(',')
    const result: any = {}

    if (!myHash?.hash) {
      signError.value = 'Не удалось создать подпись. Попробуйте еще раз.'
      return
    }

    pairs.forEach((pair: string) => {
      const [key, value] = pair.split('=')
      result[key.trim()] = value.trim().toUpperCase()
    })

    let model = {
      contractId: signData.value.contractEDSInfoModel.id,
      signToHash: myHash?.hash,
      organizationName: correctEKey.value.O,
      fullName: correctEKey.value.CN,
      address: `${result.st ? result.st : ''}, ${result.l ? result.l : ''}`
    }

    await putContractSign(model)
    toast.success(t('contract.successfully'))
    emit('update')
    isModalOpen.value = false
  } catch (e: any) {
    console.error('Ошибка при подписании через файл:', e)

    // Парсим ошибку для более понятного сообщения
    let errorMessage = e?.message || getErrorMessage(e)

    // Специальная обработка для частых ошибок
    if (errorMessage.includes('password') || errorMessage.includes('пароль')) {
      errorMessage = 'Введен неправильный пароль для файла ключа. Попробуйте еще раз.'
    } else if (errorMessage.includes('IOException') || errorMessage.includes('поврежден')) {
      errorMessage = 'PFX-файл поврежден или введен неправильный пароль.'
    }

    signError.value = errorMessage
  }
}

defineExpose({
  openModal
})

// onMounted(async () => {
//   console.log(userStore?.user?.organizationId)
// })
</script>

<style lang="scss" scoped>
.contract-info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.875rem;

  li {
    padding: 4px 0;
    min-height: 1.5em;
  }
}

// Убираем transition/анимацию для табов
:deep(.v-window__container) {
  transition: none !important;
}

:deep(.v-window-item) {
  transition: none !important;
}

// Блокировка контента при показе предупреждения
.blocked-content {
  opacity: 0.5;
  pointer-events: none;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
  }
}
</style>
