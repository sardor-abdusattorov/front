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
                <!-- Кастомный select для выбора сертификата -->
                <div class="mb-4">
                  <div class="certificate-select" @click="toggleDropdown" v-click-outside="closeDropdown">
                    <div :class="['certificate-select__trigger', { 'is-open': isDropdownOpen, 'is-expired': selectedEKey && !isKeyValid(selectedEKey) }]">
                      <div v-if="selectedEKey" class="certificate-select__selected">
                        <div class="d-flex align-center justify-space-between flex-grow-1">
                          <div class="flex-grow-1">
                            <div class="d-flex align-center mb-1">
                              <span class="font-weight-bold">{{ selectedEKey.O || 'Организация' }}</span>
                              <v-chip
                                :color="getKeyStatus(selectedEKey).color"
                                size="x-small"
                                class="ml-2"
                                variant="flat"
                              >
                                {{ t(getKeyStatus(selectedEKey).translationKey) }}
                              </v-chip>
                            </div>
                            <div class="text-caption text-grey">
                              {{ t('user.inn') }}: {{ selectedEKey.TIN }} | {{ t('certificate_owner') }}: {{ selectedEKey.CN }}
                            </div>
                          </div>
                          <v-icon>{{ isDropdownOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                        </div>
                      </div>
                      <div v-else class="certificate-select__placeholder">
                        {{ t('select_certificate') }}
                        <v-icon>{{ isDropdownOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                      </div>
                    </div>

                    <!-- Выпадающий список -->
                    <transition name="dropdown">
                      <div v-if="isDropdownOpen" class="certificate-select__dropdown">
                        <div
                          v-for="(key, index) in correctEKeys"
                          :key="index"
                          :class="['certificate-select__option', {
                            'is-selected': selectedEKey === key,
                            'is-expired': !isKeyValid(key)
                          }]"
                          @click.stop="selectKey(key)"
                        >
                          <div class="d-flex align-center mb-1">
                            <span class="font-weight-bold">{{ key.O || 'Организация' }}</span>
                            <v-chip
                              :color="getKeyStatus(key).color"
                              size="x-small"
                              class="ml-2"
                              variant="flat"
                            >
                              {{ t(getKeyStatus(key).translationKey) }}
                            </v-chip>
                          </div>
                          <div class="text-caption">
                            <div>{{ t('user.inn') }}: {{ key.TIN }}</div>
                            <div>{{ t('certificate_owner') }}: {{ key.CN }}</div>
                            <div>{{ t('valid_period') }}: {{ formatDate(key.validFrom) }} - {{ formatDate(key.validTo) }}</div>
                          </div>
                        </div>
                      </div>
                    </transition>
                  </div>
                </div>

                <!-- Предупреждение о просроченном сертификате -->
                <v-alert
                  v-if="selectedEKey && !isKeyValid(selectedEKey)"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  {{ t('certificate_expired_warning') }}
                </v-alert>

                <div class="d-flex justify-end">
                  <base-button
                    @click="signContract"
                    :disabled="isSigningBlocked || !selectedEKey || (selectedEKey && !isKeyValid(selectedEKey))"
                  >
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

// Состояние dropdown для выбора сертификата
const isDropdownOpen = ref(false)

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
const getKeyStatus = (key: ESignKey): { text: string; color: string; translationKey: string } => {
  if (!key.validTo) {
    return { text: 'Неизвестно', color: 'grey', translationKey: 'certificate_unknown' }
  }

  const valid = isKeyValid(key)
  return valid
    ? { text: 'Действителен', color: 'success', translationKey: 'certificate_valid' }
    : { text: 'Просрочен', color: 'error', translationKey: 'certificate_expired' }
}

// Управление dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const selectKey = (key: ESignKey) => {
  selectedEKey.value = key
  closeDropdown()
}

const openModal = async (contractId: number) => {
  // Сбрасываем ошибки при открытии
  clearError()
  isDropdownOpen.value = false
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

// Кастомный select для сертификатов в стиле OneID
.certificate-select {
  position: relative;

  &__trigger {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 12px 16px;
    cursor: pointer;
    background: white;
    transition: all 0.2s ease;
    min-height: 56px;
    display: flex;
    align-items: center;

    &:hover {
      border-color: rgb(var(--v-theme-primary));
    }

    &.is-open {
      border-color: rgb(var(--v-theme-primary));
      box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
    }

    &.is-expired {
      border-color: rgb(var(--v-theme-error));
      background-color: rgba(var(--v-theme-error), 0.02);
    }
  }

  &__selected {
    width: 100%;
  }

  &__placeholder {
    color: #666;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
  }

  &__option {
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: rgba(var(--v-theme-primary), 0.05);
    }

    &.is-selected {
      background-color: rgba(var(--v-theme-primary), 0.1);
      border-left: 3px solid rgb(var(--v-theme-primary));
    }

    &.is-expired {
      color: rgb(var(--v-theme-error));
      background-color: rgba(var(--v-theme-error), 0.02);

      .font-weight-bold {
        color: rgb(var(--v-theme-error));
      }

      &:hover {
        background-color: rgba(var(--v-theme-error), 0.05);
      }
    }
  }
}

// Анимация для dropdown
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
