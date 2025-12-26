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
              <div v-if="availableEKeys.length > 0">
                <!-- Select для выбора сертификата -->
                <base-select
                  v-model="selectedEKey"
                  :label="t('select_certificate')"
                  :items="availableEKeys"
                  return-object
                  class="mb-4"
                >
                  <template #item="{ item, props }">
                    <v-list-item
                      v-bind="props"
                      class="cert-list-item"
                      :class="{ 'expired': getKeyStatus(item.raw) === 'expired' }"
                    >
                      <div class="cert-card">
                        <div class="cert-name">{{ item.raw.CN || item.raw.O }}</div>
                        <div class="cert-row">
                          <v-chip size="x-small" color="primary" variant="flat">Yuridik shaxs</v-chip>
                          <span class="cert-label">STIR: <strong>{{ item.raw.TIN }}</strong></span>
                        </div>
                        <div class="cert-row">
                          <span class="cert-label">Tashkilot:</span>
                          <span class="cert-value">{{ item.raw.O }}</span>
                        </div>
                        <div class="cert-row">
                          <span class="cert-label">Sertifikat raqami: <strong>{{ item.raw.serialNumber || '-' }}</strong></span>
                          <span class="cert-divider">|</span>
                          <span class="cert-label">Sertifikatning amal qilish muddati: <strong>{{ formatKeyDate(item.raw.validFrom) }} - {{ formatKeyDate(item.raw.validTo) }}</strong></span>
                        </div>
                      </div>
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <span>{{ getCertificateTitle(item.raw) }}</span>
                  </template>
                </base-select>

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

const availableEKeys = ref<ESignKey[]>([])
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

const openModal = async (contractId: number) => {
  // Сбрасываем ошибки при открытии
  clearError()
  await fetchContractSign(contractId)
  isModalOpen.value = true
}

// Функция для парсинга даты из сертификата
const parseKeyDate = (dateStr: string): Date | null => {
  try {
    if (!dateStr) return null

    // Удаляем GMT часть и берем только дату
    // Формат: "Wed May 05 2021 11:46:51 GMT+0500 (Узбекистан, стандартное время)"
    // или "DD.MM.YYYY"
    let cleanDateStr = dateStr.trim()

    // Если формат GMT
    if (cleanDateStr.includes('GMT')) {
      // Парсим стандартный формат Date
      const date = new Date(cleanDateStr)
      if (!isNaN(date.getTime())) {
        return date
      }
    }

    // Если формат DD.MM.YYYY
    const parts = cleanDateStr.split(' ')[0].split('.')
    if (parts.length === 3) {
      const day = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const year = parseInt(parts[2])
      return new Date(year, month, day)
    }

    return null
  } catch (e) {
    return null
  }
}

// Проверка валидности ключа
const isKeyValid = (key: ESignKey): boolean => {
  if (!key.validTo) return true // если нет даты окончания, считаем валидным

  const validTo = parseKeyDate(key.validTo)
  if (!validTo) return true

  const now = new Date()
  return validTo > now
}

// Получение статуса ключа
const getKeyStatus = (key: ESignKey): 'active' | 'expired' => {
  return isKeyValid(key) ? 'active' : 'expired'
}

// Форматирование даты для отображения
const formatKeyDate = (dateStr: string): string => {
  const date = parseKeyDate(dateStr)
  if (!date) return dateStr

  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

// Функция для получения названия сертификата в select
const getCertificateTitle = (key: ESignKey): string => {
  const serial = key.serialNumber || '-'
  const status = isKeyValid(key) ? t('active_cert') : t('expired_cert')
  const validTo = formatKeyDate(key.validTo)
  return `${serial} (${status}, до ${validTo})`
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
      availableEKeys.value = eKeys.value.filter(
        (key: ESignKey) => normalizeTIN(key.TIN) === normalizedExpectedTIN
      )

      // Автоматически выбираем первый валидный ключ
      selectedEKey.value = availableEKeys.value.find(isKeyValid) || availableEKeys.value[0]
    } else if (result.contractEDSInfoModel.secondOrgModel.id === userStore.user?.organizationId) {
      expectedTIN.value = result?.contractEDSInfoModel?.secondOrgModel?.tin
      const normalizedExpectedTIN = normalizeTIN(expectedTIN.value)

      // Находим ВСЕ ключи с нужным TIN
      availableEKeys.value = eKeys.value.filter(
        (key: ESignKey) => normalizeTIN(key.TIN) === normalizedExpectedTIN
      )

      // Автоматически выбираем первый валидный ключ
      selectedEKey.value = availableEKeys.value.find(isKeyValid) || availableEKeys.value[0]
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

// Стили для карточек сертификатов как в OneID
.cert-list-item {
  min-height: auto !important;
  padding: 12px 16px !important;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }

  &.expired {
    .cert-name,
    .cert-label,
    .cert-value {
      color: #f44336 !important;
    }
  }

  :deep(.v-list-item__content) {
    padding: 0 !important;
  }
}

.cert-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cert-name {
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 4px;
}

.cert-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  flex-wrap: wrap;
}

.cert-label {
  color: #666;

  strong {
    color: #333;
    font-weight: 600;
  }
}

.cert-value {
  color: #333;
  font-weight: 500;
}

.cert-divider {
  color: #999;
  margin: 0 4px;
}
</style>
