<template>
  <v-dialog v-model="isModalOpen" width="700">
    <v-card class="pa-4">
      <div v-if="isEimzoLoading" class="pa-8 text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4">{{ t('loading_keys') || 'Загрузка ключей с USB токена...' }}</p>
      </div>
      <div v-else-if="eimzoError" class="pa-4 border-md rounded">
        <h3 class="text-red-accent-4">{{ t('error_loading_keys') || 'Ошибка загрузки ключей' }}</h3>
        <p class="mt-2">{{ eimzoError }}</p>
        <p class="mt-2 text-sm">Убедитесь что USB токен подключен и E-IMZO установлен</p>
      </div>
      <div v-else class="pa-4 border-md rounded d-flex flex-column ga-4">
        <div class="esp_modal_header">
          <div>{{ t('contractDate') }} {{ signData?.contractEDSInfoModel?.endContractDate }}</div>
          <div>{{ t('commission') }} {{ signData?.contractEDSInfoModel?.percent }}</div>
        </div>
        <div class="esp_modal_body d-flex ga-2 text-sm-body-2">
          <div class="border-md rounded pa-2 w-50">
            <ul v-if="signData?.contractEDSInfoModel" class="d-flex flex-column ga-2">
              <li>{{ signData.contractEDSInfoModel.firstOrgModel.name || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.firstOrgModel.tin || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.firstOrgModel.director || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.firstOrgModel.regNumberNds || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.firstOrgModel.mfo || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.firstOrgModel.phones || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.firstOrgModel.address || '-' }}</li>
            </ul>
          </div>
          <div class="border-md rounded pa-2 w-50">
            <ul v-if="signData?.contractEDSInfoModel" class="d-flex flex-column ga-2">
              <li>{{ signData.contractEDSInfoModel.secondOrgModel.name || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.secondOrgModel.tin || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.secondOrgModel.director || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.secondOrgModel.regNumberNds || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.secondOrgModel.mfo || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.secondOrgModel.phones || '-' }}</li>
              <li>{{ signData.contractEDSInfoModel.secondOrgModel.address || '-' }}</li>
            </ul>
          </div>
        </div>
        <div v-if="correctEKey" class="border-md rounded pa-3 d-flex align-center justify-lg-space-between">
          <div>
            <h5>{{ t('contracts.organization') }}: {{ correctEKey?.O }}</h5>
            <h6>{{ t('user.inn') }}: {{ correctEKey?.TIN }}</h6>
          </div>
          <base-button @click="signContract">{{ t('contract.menu.sign') }}</base-button>
        </div>
        <div v-else class="border-md rounded pa-3 d-flex flex-column ga-2">
          <h3 class="text-red-accent-4">{{ t('youDontHaveTrueSignKey') }}</h3>
          <div v-if="expectedTIN" class="text-sm text-grey-darken-2">
            <div><strong>Требуется ИНН:</strong> {{ expectedTIN }}</div>
            <div v-if="eKeys.length > 0">
              <strong>Доступные ключи на токене:</strong>
              <ul class="mt-2">
                <li v-for="(key, index) in eKeys" :key="index">
                  ИНН: {{ key.TIN }} - {{ key.O }}
                </li>
              </ul>
            </div>
            <div v-else class="text-warning mt-2">
              ⚠️ USB токен не обнаружен или ключи не загружены
            </div>
          </div>
        </div>
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
const { eKeys, getHashESign, isLoading: isEimzoLoading, error: eimzoError } = useEimzo()
const userStore = useUserStore()
const emit = defineEmits(['update'])
const signData = ref<GetContractSignResult>()
const isModalOpen = ref(false)

const correctEKey = ref<ESignKey>()
const expectedTIN = ref<string>('')
const availableKeys = computed(() => eKeys.value.map((k: ESignKey) => k.TIN).join(', '))

const openModal = async (contractId: number) => {
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

const signContract = async () => {
  if (!correctEKey.value || !signData.value) return
  const myHash = await getHashESign(correctEKey.value, signData.value.signToHash)
  const pairs = correctEKey.value.alias.split(',')
  const result: any = {}

  if (!myHash?.hash) return

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

  try {
    await putContractSign(model)
    toast.success(t('contract.successfully'))
    emit('update')
    isModalOpen.value = false
  } catch (e) {
    toast.error(getErrorMessage(e))
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
h3 {
  text-align: center;
  font-weight: 600;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.esp_modal_body {
  display: flex;
  gap: 16px;
  /* Adjust gap size as needed */
}

.esp_modal_body ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.esp_modal_body li {
  padding: 4px 0;
  /* Adjust padding for spacing between items */
  min-height: 1.5em;
  /* Ensures consistent height for each list item */
  display: flex;
  align-items: center;
}
</style>
