<template>
  <div class="add-form-drawer">
    <v-card>
      <v-form v-model="isValid" @submit.prevent="handleSubmit">
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-input :rules="[rules.required]" v-model="form.contractNumber"
                :disabled="(isEdit && isFond) || isView" :placeholder="t('contract.contractNumber')"
                density="comfortable" :class="{ 'cursor-not-allowed select-none': isEdit && isFond }"></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-date-input clearable hide-details v-model="form.contractDate" color="indigo" density="comfortable"
                :placeholder="t('contract.contractDate')" :disabled="isView" :rules="[rules.required]"
                name="contractDate" />
            </v-col>
            <v-col cols="12" md="3">
              <base-date-input clearable hide-details v-model="form.endContractDate" color="indigo"
                density="comfortable" :placeholder="t('contract.dateExpire')" :rules="[rules.required]"
                name="endContractDate" :allowed-dates="allowedDates" :disabled="isView" />
            </v-col>
            <v-col cols="12" md="3" v-if="showEventList">
              <base-select :placeholder="t('events.event_name')" :items="abonentEventList" item-title="name"
                :disabled="isView" item-value="id" v-model="form.eventId" density="comfortable"
                :rules="[rules.required]"></base-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="3">
              <base-select :placeholder="t('contract.structure')" :items="structureList" :rules="[rules.required]"
                :item-title="`name${capitalize(locale)}`" item-value="id" density="comfortable" :disabled="isView"
                v-model="form.structureId" @update:model-value="loadData"></base-select>
            </v-col>

            <v-col cols="12" md="3">
              <base-select :placeholder="t('contract.organization')" :items="organizationList" :rules="[rules.required]"
                v-model="form.secondOrgId" :disabled="isView" @update:model-value="updateSecondOrg" item-title="name"
                item-value="id" density="comfortable"></base-select>
            </v-col>
            <v-col cols="12" md="3" v-if="!isFond">
              <v-number-input v-model="form.percent" density="comfortable" type="number"
                :placeholder="t('contract.percent')" :disabled="isView" :rules="[rules.required]" :min="0"
                :max="100"></v-number-input>
            </v-col>
            <v-col cols="12" md="3">
              <v-textarea v-model="form.comment" rows="1" :disabled="isView" auto-grow
                :placeholder="t('contract.comment')" density="comfortable"></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="3">
              <base-document-input :label="t('load_contract')" :disabled="isView" :file="fileUrl"
                @clear-file="fileUrl = ''" @update:file="uploadFile" />
            </v-col>
          </v-row>
          <contract-organizations-info :partnerData="partnerData" />
          <h2 class="contract_info--title">{{ t('contract.main_doc') }}</h2>
          <div class="contract_info--card" v-if="mainContract">
            <div class="contract_info--close" v-if="!isEdit && !isView" @click="mainContract = null">
              <i class="mdi mdi-close"></i>
            </div>
            <div class="contract_info--content">
              <p>
                <span>{{ t('contract.id') }}: </span> {{ mainContract.id }}
              </p>
              <p>
                <span>{{ t('contract.contractNumber') }}: </span> {{ mainContract.contractNumber }}
              </p>
              <p>
                <span>{{ t('contract.conculisionDate') }}: </span>
                {{ dayjs(mainContract.contractDate).format(DATE_VIEW_FORMAT) }}
              </p>
              <p>
                <span>{{ t('contract.dateExpire') }}: </span>
                {{ dayjs(mainContract.endContractDate).format(DATE_VIEW_FORMAT) }}
              </p>
            </div>
          </div>
          <div class="contract_info--empty" v-else>{{ t('not_selected') }}</div>
          <v-row>
            <v-col cols="12" md="3" class="d-flex align-center" v-if="!isView">
              <base-button color="red" class="mr-2" to="/contract/contracts">{{ t('contract.cancel') }} </base-button>
              <base-button :loading="submitLoading" type="submit">{{
                isEdit ? t('actions.edit') : t('actions.add')
              }}</base-button>
            </v-col>
            <v-col v-if="!isFond" cols="12" md="9" class="d-flex justify-end">
              <v-checkbox v-model="form.isPercentInBilet" :disabled="isView" :label="t('ticket_percent')"
                color="indigo"></v-checkbox>
            </v-col>
          </v-row>
        </v-card-item>
      </v-form>
      <contract-main-dialog v-model="isDialogOpen" :mainContract="mainContract!" :secondOrgId="partnerData?.id"
        :parentContractId="form.parentId" @update:model-value="emit('updateDialog', $event)"
        @setMainContract="setMainContract" />
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import {
  createContract,
  getOrganizations,
  geContractStructure,
  getContractById,
  updateContract,
  updateMyContract,
  createMyContract,
  getContractAbonentEvents
} from '@/services/contracts/contracts.service'
import { CompanyDataDto, ContractsDto, CreateContractDto } from '@/services/contracts/dto/contracts.dto'
import { getErrorMessage, getFormData, formatDateTime, sleep, capitalize } from '@/utils/functions'
import { useRules } from '@/utils/rules'
import dayjs from 'dayjs'
import { DATE_VIEW_FORMAT } from '@/constants/formats'
import { useUserStore } from '@/stores/user.store'
import { STRUCTURES } from '@/constants/structures'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);


const { t, locale } = useI18n()

const props = defineProps<{ isEdit?: boolean; isDialogVisible?: boolean; isFond?: boolean, isView?: boolean }>()
const emit = defineEmits(['updateDialog'])
const apiUrl = import.meta.env.VITE_API_URL

const rules = useRules()
const isDialogOpen = ref(false)

const form = ref<CreateContractDto>({
  contractNumber: '',
  contractDate: null,
  structureId: null,
  secondOrgId: null,
  endContractDate: null,
  comment: '',
  percent: null,
  isPercentInBilet: false,
  id: undefined,
  document: undefined,
  contractFiles: undefined,
  filePath: undefined,
  parentId: null
})
const today = dayjs().startOf('day');
const allowedDates = (date: any) => dayjs(date).isSameOrAfter(today, 'day')
// const allowedDates1 = (date: any) => dayjs(date).isSameOrAfter(form.value.contractDate, 'day')
// watch(() => form.value.contractDate, () => {
// if (form.value.contractDate > form.value.endContractDate) {
//   form.value.endContractDate = null
// }
// })

const userStore = useUserStore()
const route: any = useRoute()
const router = useRouter()
const structureList = ref<any>([])
const abonentEventList = ref()
const loading = ref<boolean>(false)
const submitLoading = ref<boolean>(false)
const organizationList = ref<any>([])
const fileUrl = ref('')

const isValid = ref(false)
const partnerData = ref<CompanyDataDto>()
const mainContract = ref<ContractsDto | null>(null)

const setMainContract = (row: ContractsDto) => {
  mainContract.value = row
}

const showEventList = computed(() => {
  if (userStore.user?.structureId === STRUCTURES.ORGANIZER) {
    return true
  } else if (
    userStore.user?.structureId === STRUCTURES.AGENT &&
    form.value.structureId &&
    form.value.structureId === STRUCTURES.ORGANIZER
  ) {
    return true
  }
})

const uploadFile = async (e: any) => {
  try {
    const file = e.target.files[0]
    if (file) {
      form.value.document = file
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
  submitLoading.value = true
  form.value.endContractDate = form.value.endContractDate ? formatDateTime(form.value.endContractDate) : null
  form.value.contractDate = form.value.contractDate ? formatDateTime(form.value.contractDate) : null
  form.value.parentId = mainContract.value?.id ? mainContract.value.id : null
  const formData = getFormData(form.value)
  if (props.isFond) {
    formData.delete('isPercentInBilet')
    formData.delete('percent')
    try {
      if (props.isEdit) {
        await updateMyContract(formData)
        toast.success(t('messages.updated_success'))
      } else {
        await createMyContract(formData)
        toast.success(t('messages.added_success'))
      }
      await sleep(1000)
      router.push('/contract/contracts')
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      // form.value.endContractDate = null
      // form.value.contractDate = null
    } finally {
      submitLoading.value = false
    }
  } else {
    try {
      if (props.isEdit) {
        await updateContract(formData)
        toast.success(t('messages.updated_success'))
      } else {
        await createContract(formData)
        toast.success(t('messages.added_success'))
      }
      await sleep(1000)
      router.push('/contract/contracts')
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      // form.value.endContractDate = null
      // form.value.contractDate = null
    } finally {
      submitLoading.value = false
    }
  }
}

const fetchDataById = async () => {
  loading.value = true
  try {
    const {
      data: { result }
    } = await getContractById(route.params.id)
    form.value = result
    form.value.endContractDate = result.endContractDate ? new Date(result.endContractDate) : null
    form.value.contractDate = result.contractDate ? new Date(result.contractDate) : null
    fileUrl.value = form.value.filePath ? `${apiUrl}/${form.value.filePath}` : ''
    if (form.value.parentId) {
      const { data } = await getContractById(form.value.parentId)
      mainContract.value = data.result
    }
    if (!Array.isArray(form.value.document)) {
      form.value.document = []
    }
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const getContractAbonentEvent = async (id: any) => {
  try {
    const {
      data: { result }
    } = await getContractAbonentEvents(id)
    abonentEventList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const structureData = async () => {
  loading.value = true
  try {
    const {
      data: { result }
    } = await geContractStructure()
    structureList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  try {
    const {
      data: { result }
    } = await getOrganizations(form.value.structureId)
    organizationList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const updateSecondOrg = () => {
  partnerData.value = organizationList.value.find((item: any) => item.id === form.value.secondOrgId)

  if (form.value.structureId === STRUCTURES.ORGANIZER && form.value.secondOrgId) {
    getContractAbonentEvent(form.value.secondOrgId)
  }
}

watch(
  () => props.isDialogVisible,
  () => {
    isDialogOpen.value = props.isDialogVisible
  }
)

onMounted(async () => {
  await structureData()
  if (props.isEdit) {
    await Promise.all([fetchDataById(), loadData()])
    updateSecondOrg()
  }
  if (props.isView) {
    await Promise.all([fetchDataById(), loadData()])
    updateSecondOrg()
  }


  if (userStore.user?.structureId === STRUCTURES.ORGANIZER) {
    await getContractAbonentEvent(undefined)
  }
})
</script>

<style lang="scss" scoped>
.contract_info {
  &--title {
    font-size: 24px;
    margin: 18px 0 10px;
  }

  &--card {
    background-color: #f6f6f6;
    padding: 18px;
    border-radius: 5px;
    margin-bottom: 10px;
    width: fit-content;
    position: relative;
  }

  &--close {
    position: absolute;
    top: 2px;
    right: 2px;
    cursor: pointer;
  }

  &--content {
    display: flex;
    flex-direction: column;
    gap: 3px;

    p {
      font-size: 18px;

      span {
        font-weight: 500;
      }
    }
  }

  &--empty {
    font-size: 18px;
    color: #999;
  }
}
</style>
