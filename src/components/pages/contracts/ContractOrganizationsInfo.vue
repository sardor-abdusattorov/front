<template>
  <v-card-item>
    <v-row>
      <v-col cols="6" class="d-flex flex-column ga-4">
        <base-input
          :model-value="companyData?.tin"
          :placeholder="t('contracts.your_info')"
          :disabled="true"
          density="comfortable"
        ></base-input>
        <base-input
          :placeholder="t('contracts.organization')"
          :disabled="true"
          :model-value="companyData?.name"
          density="comfortable"
        ></base-input>
        <base-input
          :placeholder="t('contracts.address_organization')"
          :disabled="true"
          :model-value="companyData?.address"
          density="comfortable"
        ></base-input>
      </v-col>
      <v-col cols="6" class="d-flex flex-column ga-4">
        <base-input
          :model-value="partnerData?.tin"
          :placeholder="t('contracts.info_contragent')"
          :disabled="true"
          density="comfortable"
        ></base-input>
        <base-input
          :placeholder="t('contracts.contragent_organization')"
          :disabled="true"
          :model-value="partnerData?.name"
          density="comfortable"
        ></base-input>
        <base-input
          :placeholder="t('contracts.contragent_address')"
          :disabled="true"
          :model-value="partnerData?.address"
          density="comfortable"
        ></base-input>
      </v-col>
    </v-row>
  </v-card-item>
</template>

<script lang="ts" setup>
import { getCompanyData } from '@/services/contracts/contracts.service'
import { CompanyDataDto } from '@/services/contracts/dto/contracts.dto'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const companyData = ref<CompanyDataDto | null>(null)

const { t } = useI18n()

defineProps({
  partnerData: {
    type: Object,
    default: () => null
  }
})

const fetchData = async () => {
  try {
    const {
      data: { result }
    } = await getCompanyData()
    companyData.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

fetchData()
</script>
