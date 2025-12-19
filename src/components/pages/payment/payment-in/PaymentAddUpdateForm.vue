<template>
  <v-card>
    <v-form v-model="isValid" @submit.prevent="handleSubmit">
      <v-card-item>
        <v-row>
          <v-col cols="12" md="6">
            <base-input v-model="form.docNumber" :rules="[rules.required]" :placeholder="t('documentNumber')" />
          </v-col>
          <v-col cols="12" md="6">
            <base-input v-model="form.paymentCode" :rules="[rules.required]" :placeholder="t('paymentCode')" />
          </v-col>
          <v-col cols="12" md="6">
            <base-input v-model="form.summa" :rules="[rules.required]" :placeholder="t('sum')" />
          </v-col>
          <v-col cols="12" md="3">
            <base-date-input v-model="dataTime.date" :rules="[rules.required]" :placeholder="t('paymentDate')" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="dataTime.time"
              :rules="[rules.required]"
              :active="timeModal"
              :focused="timeModal"
              density="compact"
              prepend-inner-icon="mdi-clock-time-four-outline"
              readonly
            >
              <v-dialog v-model="timeModal" activator="parent" width="auto">
                <v-time-picker format="24hr" v-if="timeModal" v-model="dataTime.time"></v-time-picker>
              </v-dialog>
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <base-input v-model="form.buyerMFO" :rules="[rules.required]" :placeholder="t('payerMFO')" />
          </v-col>
          <v-col cols="12" md="6">
            <base-input v-model="form.sellerMfo" :rules="[rules.required]" :placeholder="t('recipientMFO')" />
          </v-col>
          <v-col cols="12" md="6">
            <base-input v-model="form.buyerAcc" :rules="[rules.required]" :placeholder="t('payersAccount')" />
          </v-col>
          <v-col cols="12" md="6">
            <base-input v-model="form.sellerAcc" :rules="[rules.required]" :placeholder="t('recipientAccount')" />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea
              v-model="form.remark"
              :rules="[rules.required]"
              placeholder="Детали платежа"
              rows="1"
              outlined
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="3">
            <div class="d-flex align-center ga-2">
              <base-button :loading="submitLoading" color="primary" class="rounded-xl" type="submit">{{
                isEdit ? t('tariffs.menu.edit') : t('add')
              }}</base-button>
              <base-button color="red" @click="router.go(-1)" class="rounded-xl">{{ t('cancel') }}</base-button>
            </div>
          </v-col>
        </v-row>
      </v-card-item>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRules } from '@/utils/rules'
import { AddInvoice, GetPaymentClearingById, InvoiceUpdateInvoice } from '@/services/payment/payment.service'
import { getErrorMessage, sleep } from '@/utils/functions'
import { toast } from 'vue3-toastify'

const props = defineProps<{ isEdit?: boolean; orgId?: number; paymentId?: number }>()

const { t } = useI18n()
const rules = useRules()
const router = useRouter()

const dataTime = ref({
  date: new Date(),
  time: new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes()
})
const id = ref()
const timeModal = ref(false)
const isValid = ref(false)
const submitLoading = ref(false)
const currencyId = ref(1)
const buyerOrgId = ref(props.orgId)
const requestData = ref()
const form = ref({
  docNumber: '',
  buyerMFO: '',
  buyerAcc: '',
  summa: 0,
  sellerMfo: '',
  sellerInn: '',
  sellerAcc: '',
  remark: '',
  paymentCode: ''
})

const handleSubmit = async () => {
  if (!isValid.value) return
  const year = dataTime.value.date.getFullYear()
  const month = (dataTime.value.date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based, so add 1
  const day = dataTime.value.date.getDate().toString().padStart(2, '0')

  const combinedDateTime = `${year}-${month}-${day}T${dataTime.value.time}:00.000Z`
  requestData.value = {
    ...form.value,
    invoiceDate: combinedDateTime,
    currencyId: currencyId.value,
    buyerOrgId: buyerOrgId.value
  }

  if (props.isEdit) {
    // Update
    requestData.value.id = id.value
    try {
      submitLoading.value = true
      await InvoiceUpdateInvoice(requestData.value)
      toast.success(t('contract.successfully'))
      await sleep(1000)
      await router.push(`/payment/payment-in/list/${props.orgId}`)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      submitLoading.value = false
    }
  } else {
    // Create
    try {
      submitLoading.value = true
      await AddInvoice(requestData.value)
      toast.success(t('contract.successfully'))
      await sleep(1000)
      await router.push(`/payment/payment-in/list/${props.orgId}`)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      submitLoading.value = false
    }
  }
}

const fetchData = async () => {
  if (!props.paymentId) return
  try {
    const {
      data: { result }
    } = await GetPaymentClearingById(props.paymentId)

    form.value = {
      docNumber: result.docNumber,
      buyerMFO: result.buyerMFO,
      buyerAcc: result.buyerAcc,
      summa: result.summa,
      sellerMfo: result.sellerMfo,
      sellerInn: result.sellerInn,
      sellerAcc: result.sellerAcc,
      remark: result.remark,
      paymentCode: result.paymentCode
    }
    dataTime.value = {
      date: new Date(result.invoiceDate),
      time:
        new Date(result.invoiceDate).getHours().toString().padStart(2, '0') +
        ':' +
        new Date(result.invoiceDate).getMinutes().toString().padStart(2, '0')
    }
    id.value = result.id
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

onMounted(async () => {
  if (props.isEdit && props.paymentId) {
    await fetchData()
  }
})
</script>

<style scoped></style>
