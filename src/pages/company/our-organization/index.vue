<template>
  <div class="d-flex flex-column ga-4">
    <v-card :style="companyStatus" class="success">
      <v-card-item>
        <h4>{{ t('status') }}: {{ statusList[companyData?.statusId as '1' | '2' | '3' | '4'] }}</h4>
        <br v-if="companyData?.rejectReason && companyData?.statusId === 3" />
        <h4 v-if="companyData?.rejectReason && companyData?.statusId === 3">
          {{ t('events.reason_reject') }}: {{ companyData.rejectReason }}
        </h4>
      </v-card-item>
    </v-card>
    <v-card>
      <v-card-item>
        <v-row>
          <v-col cols="12" md="4">
            <base-input
              v-if="companyData"
              :label="t('contracts.organization')"
              type="text"
              density="compact"
              v-model="companyData.name"
              :disabled="true"
            />
          </v-col>
          <v-col cols="12" md="4">
            <base-input
              v-if="companyData"
              :label="t('user.director')"
              type="text"
              density="compact"
              v-model="companyData.director"
              :disabled="true"
            />
          </v-col>
          <v-col cols="12" md="4">
            <base-input
              v-if="companyData"
              :label="t('halls.address')"
              type="text"
              density="compact"
              v-model="companyData.address"
              :disabled="true"
            />
          </v-col>
          <v-col cols="12" md="4">
            <base-input
              v-if="companyData"
              :label="t('user.inn')"
              type="text"
              density="compact"
              v-model="companyData.tin"
              :disabled="true"
            />
          </v-col>
          <v-col cols="12" md="4">
            <base-input
              v-if="companyData"
              :label="t('user.email')"
              type="text"
              density="compact"
              v-model="companyData.email"
              :disabled="true"
            />
          </v-col>
          <v-col cols="12" md="4">
            <base-input
              v-if="companyData"
              :label="t('user.phone')"
              type="text"
              density="compact"
              v-model="companyData.phones"
              :disabled="true"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <base-button to="/company/our-organization/update"> {{ t('actions.edit') }}</base-button>
          </v-col>
        </v-row>
      </v-card-item>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRules } from '@/utils/rules'
import { PERMISSIONS } from '@/constants/permissions'
import { getCompanyData } from '@/services/contracts/contracts.service'

definePage({
  meta: {
    permission: PERMISSIONS.OUR_ORGANIZATION
  }
})

const { t, locale } = useI18n()
const rules = useRules()

const companyStatus = computed(() => {
  return companyData.value?.statusId === 1
    ? 'border: 1px solid #FE9900; background-color: #FE990010'
    : companyData.value?.statusId === 2
      ? 'border: 1px solid #7DDA58; background-color: #7DDA5810'
      : companyData.value?.statusId === 3
        ? 'border: 1px solid #E4080A; background-color: #E4080A10'
        : 'border 1px solid #BFD641; background-color: #BFD64110'
})

const statusList = ref({
  '1': t('new'),
  '2': t('approved'),
  '3': t('rejected'),
  '4': t('edited')
})

const companyData = ref()

const fetchMyOrganization = async () => {
  try {
    const {
      data: { result }
    } = await getCompanyData()
    companyData.value = result
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  await Promise.all([fetchMyOrganization()])
})
</script>

<style scoped></style>
