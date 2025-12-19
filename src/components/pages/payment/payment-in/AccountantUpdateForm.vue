<template>
  <div>
    <v-card>
      <v-form v-model="isValid" @submit.prevent="handleSubmit">
        <v-card-item>
          <v-row>
            <v-col cols="12" md="6" v-if="userStore.user?.structureId === STRUCTURES.SUPERVISOR">
              <base-select
                :rules="[rules.required]"
                v-model="form.orgId"
                :items="tourAgents"
                item-title="name"
                item-value="id"
                :placeholder="t('events.agents')"
                :disabled="props.isView"
              ></base-select>
            </v-col>
            <v-col cols="12" md="6">
              <base-input
                v-model="form.summa"
                type="number"
                :disabled="props.isView"
                :rules="[rules.required]"
                :placeholder="t('sum')"
              />
            </v-col>
            <v-col cols="12" md="3">
              <base-date-input
                v-model="dataTime.date"
                :disabled="props.isView"
                :rules="[rules.required]"
                :placeholder="t('paymentDate')"
              />
            </v-col>
            <v-col cols="12" md="3">
              <base-document-input
                :label="t('load_contract')"
                :file="fileUrl"
                :disabled="props.isView"
                @clear-file="fileUrl = ''"
                @update:file="uploadFile"
                :rules="[rules.required, rules.imageRequired]"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="dataTime.time"
                :rules="[rules.required]"
                :active="timeModal"
                :focused="timeModal"
                :disabled="props.isView"
                density="compact"
                prepend-inner-icon="mdi-clock-time-four-outline"
                readonly
              >
                <v-dialog v-model="timeModal" activator="parent" width="auto">
                  <v-time-picker
                    format="24hr"
                    :disabled="props.isView"
                    v-if="timeModal"
                    v-model="dataTime.time"
                  ></v-time-picker>
                </v-dialog>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                :disabled="props.isView"
                v-model="form.comment"
                placeholder="Детали платежа"
                rows="1"
                outlined
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="3">
              <div class="d-flex align-center ga-2">
                <base-button
                  v-if="!props.isView"
                  :loading="submitLoading"
                  color="primary"
                  class="rounded-xl"
                  type="submit"
                  >{{ isEdit ? t('tariffs.menu.edit') : t('add') }}</base-button
                >
                <base-button color="red" @click="router.go(-1)" class="rounded-xl">{{ t('cancel') }}</base-button>
              </div>
            </v-col>
          </v-row>
        </v-card-item>
      </v-form>
    </v-card>
    <v-card
      v-if="invoiceData?.rejectReason"
      style="border: 1px solid #e4080a; background-color: #e4080a10; margin-top: 30px"
      class="success"
    >
      <v-card-item>
        <span v-if="invoiceData?.rejectReason"
          >{{ t('events.reason_reject') }}:
          <h3>{{ invoiceData.rejectReason }}</h3></span
        >
      </v-card-item>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRules } from '@/utils/rules'
import {
  AddInvoice,
  CreateTourAgentInvoice,
  GetPaymentClearingById,
  GetTourAgentInvoiceById,
  InvoiceUpdateInvoice,
  UpdateTourAgentInvoice
} from '@/services/payment/payment.service'
import { getErrorMessage, getFormData, sleep } from '@/utils/functions'
import { toast } from 'vue3-toastify'
import { file } from '@babel/types'
import { getTourAgentList } from '@/services/contracts/contracts.service'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'

const props = defineProps<{ isEdit?: boolean; orgId?: number; paymentId?: number; isView?: boolean }>()
const apiUrl = import.meta.env.VITE_API_URL

const { t } = useI18n()
const rules = useRules()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const dataTime = ref({
  date: new Date(),
  time: new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes()
})
const id = ref()
const timeModal = ref(false)
const invoiceData = ref()
const isValid = ref(false)
const submitLoading = ref(false)
const requestData = ref()
const tourAgents = ref()
const fileUrl = ref('')
const eventList = ref()
const form = ref<any>({
  summa: null,
  comment: '',
  orgId: null,
  file: ''
})

if (route.query.orgId && userStore.user?.structureId === STRUCTURES.SUPERVISOR) {
  form.value.orgId = Number(route.query.orgId)
}

const uploadFile = async (e: any) => {
  try {
    const file = e.target.files[0]
    if (file) {
      form.value.file = file
      fileUrl.value = URL.createObjectURL(file)
    } else {
      toast.warning(t('select_file'))
    }
  } catch (error) {
    toast.error(getErrorMessage(e))
  }
}

const handleSubmit = async () => {
  if (!isValid.value) return
  const year = dataTime.value.date.getFullYear()
  const month = (dataTime.value.date.getMonth() + 1).toString().padStart(2, '0') // Months are zero-based, so add 1
  const day = dataTime.value.date.getDate().toString().padStart(2, '0')

  const combinedDateTime = `${year}-${month}-${day}T${dataTime.value.time}:00.000Z`
  requestData.value = {
    ...form.value,
    invoiceDate: combinedDateTime
  }

  if (props.isEdit) {
    // Update
    requestData.value.id = id.value
    const formData = getFormData(requestData.value)
    try {
      submitLoading.value = true
      await UpdateTourAgentInvoice(formData)
      toast.success(t('contract.successfully'))
      await sleep(1000)
      await router.push(`/payment-transactions`)
    } catch (e) {
      toast.error(getErrorMessage(e))
    } finally {
      submitLoading.value = false
    }
  } else {
    const formData = getFormData(requestData.value)
    try {
      submitLoading.value = true
      await CreateTourAgentInvoice(formData)
      toast.success(t('contract.successfully'))
      await sleep(1000)
      await router.push(`/payment-transactions`)
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
    } = await GetTourAgentInvoiceById(props.paymentId)

    form.value = {
      summa: result.summa,
      comment: result.comment,
      orgId: result.orgId,
      file: ''
    }

    invoiceData.value = result
    dataTime.value = {
      date: new Date(result.invoiceDate),
      time:
        new Date(result.invoiceDate).getHours().toString().padStart(2, '0') +
        ':' +
        new Date(result.invoiceDate).getMinutes().toString().padStart(2, '0')
    }
    fileUrl.value = result.filePath ? `${apiUrl}/${result.filePath}` : ''
    console.log(result)
    id.value = result.id
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const fetchTourAgents = async () => {
  try {
    const {
      data: { result }
    } = await getTourAgentList()
    tourAgents.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

onMounted(async () => {
  if (props.isEdit && props.paymentId) {
    await fetchData()
  }
  if (userStore.user?.structureId === STRUCTURES.SUPERVISOR) {
    Promise.all([fetchTourAgents()])
  } else {
    form.value.orgId = userStore.user?.organizationId as number
  }
})
</script>

<style scoped></style>
