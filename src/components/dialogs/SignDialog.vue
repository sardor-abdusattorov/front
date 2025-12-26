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
              <div v-if="correctEKeys.length > 0">
                <!-- Список сертификатов -->
                <div class="mb-4">
                  <div class="text-body-2 text-grey mb-3">Выберите сертификат:</div>
                  <v-radio-group v-model="selectedEKey" hide-details>
                    <v-card
                      v-for="(key, index) in correctEKeys"
                      :key="index"
                      :class="['key-item mb-3', { 'key-item-selected': selectedEKey === key, 'key-item-expired': !isKeyValid(key) }]"
                      variant="outlined"
                      @click="selectedEKey = key"
                    >
                      <v-card-text class="pa-3">
                        <div class="d-flex align-center">
                          <v-radio :value="key" hide-details class="mr-3"></v-radio>
                          <div class="flex-grow-1">
                            <div class="d-flex align-center mb-1">
                              <span class="font-weight-bold">{{ key.O || 'Организация' }}</span>
                              <v-chip
                                :color="getKeyStatus(key).color"
                                size="small"
                                class="ml-2"
                                variant="flat"
                              >
                                {{ getKeyStatus(key).text }}
                              </v-chip>
                            </div>
                            <div class="text-sm text-grey">
                              <div>ИНН: {{ key.TIN }}</div>
                              <div>Владелец: {{ key.CN }}</div>
                              <div class="d-flex align-center">
                                <span>Срок действия:</span>
                                <span class="ml-1">{{ formatDate(key.validFrom) }} - {{ formatDate(key.validTo) }}</span>
                              </div>
                              <div v-if="key.diskAlias" class="text-caption">{{ key.diskAlias }}</div>
                            </div>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-radio-group>
                </div>

                <div class="d-flex justify-end">
                  <base-button @click="signContract" :disabled="isSigningBlocked || !selectedEKey">
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

const correctEKeys = ref<ESignKey[]>([])
const selectedEKey = ref<ESignKey>()
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

// Проверка срока действия сертификата
const isKeyValid = (key: ESignKey): boolean => {
  if (!key.validTo) return true // Если нет даты - считаем валидным

  const validToDate = new Date(key.validTo)
  const now = new Date()
  return validToDate > now
}

// Форматирование даты для отображения
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
}

// Получение статуса ключа
const getKeyStatus = (key: ESignKey): { text: string; color: string } => {
  if (!key.validTo) {
    return { text: 'Неизвестно', color: 'grey' }
  }

  const valid = isKeyValid(key)
  return valid
    ? { text: 'Действителен', color: 'success' }
    : { text: 'Просрочен', color: 'error' }
}

const openModal = async (contractId: number) => {
  // Сбрасываем ошибки при открытии
  clearError()
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

      // Находим ВСЕ ключи с нужным TIN
      correctEKeys.value = eKeys.value.filter(
        (key: ESignKey) => normalizeTIN(key.TIN) === normalizedExpectedTIN
      )
    } else if (result.contractEDSInfoModel.secondOrgModel.id === userStore.user?.organizationId) {
      expectedTIN.value = result?.contractEDSInfoModel?.secondOrgModel?.tin
      const normalizedExpectedTIN = normalizeTIN(expectedTIN.value)

      // Находим ВСЕ ключи с нужным TIN
      correctEKeys.value = eKeys.value.filter(
        (key: ESignKey) => normalizeTIN(key.TIN) === normalizedExpectedTIN
      )
    }

    // Автоматически выбираем первый действующий ключ, если он есть
    if (correctEKeys.value.length > 0) {
      const validKey = correctEKeys.value.find(key => isKeyValid(key))
      selectedEKey.value = validKey || correctEKeys.value[0]
    }

    signData.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

// Подписание через USB токен
const signContractWithToken = async () => {
  if (!signData.value) return

  try {
    // Вызываем подписание через токен - появится окно ввода PIN-кода
    const myHash = await signWithToken(tokenType.value, signData.value.signToHash)

    if (!myHash?.hash) {
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
    // Усиленная проверка на отмену пользователем
    const isCancelled =
      e?.status === -5000 ||
      e?.status === '-5000' ||
      e?.status == -5000 ||
      e?.reason?.toLowerCase().includes('отмен') ||
      e?.reason?.toLowerCase().includes('cancel') ||
      e?.message?.toLowerCase().includes('отмен') ||
      e?.message?.toLowerCase().includes('cancel')

    if (isCancelled) {
      // Пользователь просто отменил операцию - это не ошибка, не показываем уведомление
      return
    }

    // Показываем реальные ошибки от сервера
    toast.error(getErrorMessage(e))
  }
}

// Подписание через файл ключа
const signContract = async () => {
  if (!selectedEKey.value || !signData.value) return

  try {
    const myHash = await getHashESign(selectedEKey.value, signData.value.signToHash)

    // Если вернулся null - пользователь отменил операцию, просто выходим
    if (!myHash) {
      return
    }

    const pairs = selectedEKey.value.alias.split(',')
    const result: any = {}

    if (!myHash.hash) {
      return
    }

    pairs.forEach((pair: string) => {
      const [key, value] = pair.split('=')
      result[key.trim()] = value.trim().toUpperCase()
    })

    let model = {
      contractId: signData.value.contractEDSInfoModel.id,
      signToHash: myHash?.hash,
      organizationName: selectedEKey.value.O,
      fullName: selectedEKey.value.CN,
      address: `${result.st ? result.st : ''}, ${result.l ? result.l : ''}`
    }

    await putContractSign(model)
    toast.success(t('contract.successfully'))
    emit('update')
    isModalOpen.value = false
  } catch (e: any) {
    // Усиленная проверка на отмену пользователем
    const isCancelled =
      e?.status === -5000 ||
      e?.status === '-5000' ||
      e?.status == -5000 ||
      e?.reason?.toLowerCase().includes('отмен') ||
      e?.reason?.toLowerCase().includes('cancel') ||
      e?.message?.toLowerCase().includes('отмен') ||
      e?.message?.toLowerCase().includes('cancel')

    if (isCancelled) {
      // Пользователь просто отменил операцию - это не ошибка, не показываем уведомление
      return
    }

    // Показываем реальные ошибки от сервера
    toast.error(getErrorMessage(e))
  }
}

defineExpose({
  openModal
})
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

// Стили для элементов списка сертификатов
.key-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &-selected {
    border-color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.05);
  }

  &-expired {
    opacity: 0.7;
    background-color: rgba(var(--v-theme-error), 0.03);

    &:hover {
      border-color: rgba(var(--v-theme-error), 0.3);
    }
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
