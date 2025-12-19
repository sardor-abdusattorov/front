<template>
  <div class="update-form-drawer">
    <v-card>
      <v-form v-model="isValid" @submit.prevent="handleSubmit" autocomplete="off" aria-autocomplete="none">
        <v-card-item>
          <v-row>
            <!-- Organization Name -->
            <v-col cols="12" md="6">
              <base-input
                v-model="form.name"
                :rules="[rules.required]"
                :placeholder="t('halls.name')"
                clearable
                disabled
              ></base-input>
            </v-col>

            <!-- Region and INN -->
            <v-col cols="12" md="3">
              <base-mask-input
                v-model="form.tin"
                :rules="[rules.required, rules.innRule]"
                :placeholder="t('user.inn')"
                ref="tinInput"
                :options="{
                  mask: '#########'
                }"
                disabled
                clearable
              ></base-mask-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select
                :rules="[rules.required]"
                v-model="form.regionId"
                :items="regions"
                :item-title="`name${capitalize(locale)}`"
                item-value="id"
                :placeholder="t('REGION')"
              ></base-select>
            </v-col>

            <!-- District and Type, NDS, OKOHX -->
            <v-col cols="12" md="3">
              <base-select
                :rules="[rules.required]"
                v-model="form.districtId"
                :items="districts"
                :item-title="`name${capitalize(locale)}`"
                item-value="id"
                :placeholder="t('district')"
              ></base-select>
            </v-col>
            <v-col cols="12" md="9"></v-col>
            <!-- <v-col cols="12" md="3">
              <base-select
                :rules="[rules.required]"
                v-model="form.structureId"
                :items="types"
                :item-title="`name${capitalize(locale)}`"
                item-value="value"
                :placeholder="t('type')"
                disabled
              ></base-select>
            </v-col> -->
            <!-- <v-col cols="12" md="3">
              <base-select
                v-model="form.parentId"
                :items="supervisorList"
                item-title="name"
                item-value="id"
                :placeholder="t('supervisor')"
              >
              </base-select>
            </v-col> -->

            <!-- <v-col cols="12" md="3">
              <base-input
                v-model="form.regNumberNds"
                :rules="[rules.required]"
                :placeholder="t('VATRegistrationCode')"
                clearable
              ></base-input>
            </v-col> -->
            <!-- <v-col cols="12" md="3">
              <base-mask-input
                v-model="form.okonh"
                :rules="[rules.required, rules.okonxRule]"
                :placeholder="t('okonx')"
                :options="{
                  mask: '####'
                }"
                clearable
              ></base-mask-input>
            </v-col> -->

            <!-- OKED DOCUMENT, FIO -->
            <!-- <v-col cols="12" md="3">
              <base-mask-input
                v-model="form.oked"
                :options="{
                  mask: '#####'
                }"
                :rules="[rules.required, rules.okedRule]"
                :placeholder="t('oked')"
                clearable
              ></base-mask-input>
            </v-col> -->
            <!-- <v-col cols="12" md="3">
              <base-document-input
                :label="t('document_organization')"
                :file="fileUrl"
                @clear-file="fileUrl = ''"
                @update:file="uploadFile"
                accept="image/*,.pdf,.doc,.docx,.xml"
                icon="mdi-cloud-upload"
                after-upload-icon="mdi-text-box-check"
                density="compact"
              />
            </v-col> -->
            <!-- <v-col cols="12" md="3">
              <base-input
                v-model="form.accountant"
                :rules="[rules.required]"
                :placeholder="t('accountantFullName')"
                clearable
              ></base-input>
            </v-col> -->

            <!--Address-->
            <v-col cols="12" md="6">
              <v-textarea v-model="form.address" :label="t('halls.address')" rows="1" outlined></v-textarea>
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea v-model="form.comment" :label="t('halls.description')" rows="1" outlined></v-textarea>
            </v-col>

            <!--Checkboxes-->
            <v-col cols="12" md="2" :class="cashBoxClasses" class="cashboxInput">
              <v-checkbox
                label="Кассы предусмотрены"
                v-model="form.haveCashbox"
                :value="true"
                @change="handleChangeCheckbox"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="2" :class="cashBoxClasses" class="cashboxInput">
              <v-checkbox
                label="Кассы не предусмотрены"
                v-model="form.haveCashbox"
                :value="false"
                @change="handleChangeCheckbox"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="4" :class="debtLimitClasses" class="debtLimit">
              <base-input
                type="number"
                :rules="[rules.required]"
                :min="0"
                v-model="form.debtLimit"
                :placeholder="t('debtLimitWithDescription')"
                clearable
              ></base-input>
            </v-col>
            <v-col cols="12" md="2">
              <BaseMaskInput
                :rules="[rules.required, rules.phoneRule]"
                v-model="form.phones"
                :placeholder="t('halls.phone')"
                label=""
              />
            </v-col>
            <!-- <v-col cols="12" md="2">
              <BaseMaskInput
                :rules="[rules.required, rules.phoneRule]"
                v-model="form.faxPhones"
                :placeholder="t('fax')"
                label=""
              />
            </v-col> -->

            <!-- Additional Fields -->
            <v-col cols="12" md="3">
              <base-input v-model="form.email" :placeholder="t('organization.email')" label="" clearable />
            </v-col>
            <v-col cols="12" md="3">
              <base-input
                v-model="form.userPosition"
                :rules="[rules.required]"
                :placeholder="t('user.position')"
                label=""
              />
            </v-col>
            <v-col cols="12" md="3">
              <base-input
                v-model="form.userLastName"
                :rules="[rules.required]"
                :placeholder="t('user.userLastName')"
                label=""
              />
            </v-col>
            <v-col cols="12" md="3">
              <base-input
                v-model="form.userFirstName"
                :rules="[rules.required]"
                :placeholder="t('user.userFirstName')"
                label=""
              />
            </v-col>

            <!-- User Details -->
            <v-col cols="12" md="3">
              <base-input
                v-model="form.userMiddleName"
                :rules="[rules.required]"
                :placeholder="t('user.userMiddleName')"
                label=""
              />
            </v-col>
            <v-col cols="12" md="3">
              <BaseMaskInput
                :rules="[rules.required]"
                v-model="form.userInn"
                :placeholder="t('user.userInn')"
                label=""
                :options="{
                  mask: '#########',
                  eager: false
                }"
              />
            </v-col>
            <v-col cols="12" md="6">
              <base-input
                v-model="form.login"
                :rules="[rules.required]"
                :placeholder="t('login.login')"
                autocomplete="new-password"
                label=""
              />
            </v-col>

            <!-- User Details -->
            <v-col cols="12" md="3">
              <base-input
                v-model="form.password"
                :append-icon="passwordShow ? 'mdi-eye-off' : 'mdi-eye'"
                :placeholder="t('login.confirm_password')"
                :type="passwordShow ? 'text' : 'password'"
                label=""
                @click:append="passwordShow = !passwordShow"
                autocomplete="one-time-code"
              />
            </v-col>
            <v-col cols="12" md="3">
              <base-input
                v-model="form.confirmPassword"
                :append-icon="confirmPasswordShow ? 'mdi-eye-off' : 'mdi-eye'"
                :placeholder="t('login.password')"
                :type="confirmPasswordShow ? 'text' : 'password'"
                label=""
                @click:append="confirmPasswordShow = !confirmPasswordShow"
                autocomplete="one-time-code"
              />
            </v-col>
            <!-- <v-col cols="12" md="3">
              <v-checkbox :label="t('active')" v-model="form.isActive"></v-checkbox>
            </v-col>
            <v-col cols="12" md="3">
              <v-checkbox :label="t('foreign_organization')" v-model="form.isForeign"></v-checkbox>
            </v-col> -->

            <!-- Password Fields -->
            <!-- <v-col cols="12" md="3">
              <v-checkbox
                :label="t('taxpayer')"
                v-model="form.isTaxpayer"
                @change="handleTaxPayerCheckbox"
              ></v-checkbox>
            </v-col>
            <v-col cols="12" md="3">
              <base-input
                :disabled="isVatDisabled"
                :class="{ 'cursor-not-allowed': isVatDisabled }"
                v-model="form.vat"
                :placeholder="t('taxPercentage')"
                type="number"
                :min="0"
                label=""
              />
            </v-col> -->
          </v-row>
          <v-row>
            <v-col cols="12" md="4" class="d-flex align-center">
              <base-button :loading="submitLoading" type="submit" class="mr-2 rounded-xl">{{
                t('actions.edit')
              }}</base-button>
              <base-button :loading="checkTinLoading" @click="checkTin" class="mr-2 rounded-xl">{{
                t('checkingVatTaxPayerStatus')
              }}</base-button>
              <base-button @click="cancel" class="rounded-xl" color="red">{{ t('cancel') }}</base-button>
            </v-col>
          </v-row>
        </v-card-item>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue3-toastify'
import { getErrorMessage, sleep, structureChecker } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { useRules } from '@/utils/rules'
import { CreateOrganizationDto } from '@/services/organization/dto/organization.dto'
import {
  checkVatTaxpayerStatus,
  createOrganization,
  getStructureListWithoutFond,
  updateOrganization,
  updateOrganizationFiles
} from '@/services/organization/organization.service'
import { getDistrictList, getRegionList } from '@/services/report-region/report-region.service'
import { createAddImage } from '@/services/events/events.service'
import { capitalize } from '@/utils/functions'
import { getSuperVisiourList } from '@/services/administration/admin.service'
import { getCompanyData } from '@/services/contracts/contracts.service'
import { PERMISSIONS } from '@/constants/permissions'

const { t, locale } = useI18n()
const rules = useRules()
const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL

definePage({
  meta: {
    permission: PERMISSIONS.OUR_ORGANIZATION
  }
})

const fileData = ref()
const loading = ref(false)
const tinInput = ref<HTMLInputElement | null>(null)
const regions = ref([])
const districts = ref([])
const types = ref()
const isValid = ref(false)
const submitLoading = ref(false)
const checkTinLoading = ref(false)
const isVatDisabled = ref(false)
const passwordShow = ref(false)
const debtLimitClasses = ref<string[]>([])
const cashBoxClasses = ref<string[]>([])
const supervisorList = ref([])
const fileUrl = ref('')
const confirmPasswordShow = ref(false)
const form = ref<CreateOrganizationDto>({
  tin: '',
  regionId: undefined,
  parentId: null,
  districtId: undefined,
  structureId: undefined,
  regNumberNds: '',
  name: '',
  okonh: '',
  oked: '',
  files: '',
  accountant: '',
  address: '',
  comment: '',
  haveCashbox: true,
  debtLimit: 0,
  faxPhones: '',
  phones: '',
  email: '',
  userPosition: '',
  userLastName: '',
  userMiddleName: '',
  userFirstName: '',
  userInn: '',
  login: '',
  password: '',
  confirmPassword: '',
  isActive: false,
  isForeign: false,
  isTaxpayer: true,
  vat: 12
})

const handleSubmit = async () => {
  if (!isValid.value) return
  if (form.value.files) {
    const formData = new FormData()
    formData.append('field', 'orgfiles')
    formData.append('files', form.value.files)
    try {
      submitLoading.value = true
      const {
        data: { result }
      } = await createAddImage(formData)
      fileData.value = result
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      submitLoading.value = false
      if (form.value.files) {
        delete form.value.files
      }
    }
  }
  try {
    submitLoading.value = true

    const {
      data: { result }
    } = await updateOrganization(form.value)
    toast.success(t('messages.added_success'))
    if (fileData.value) {
      await updateOrganizationFiles({ companyId: result.id, fileName: fileData.value.path })
    }
    await sleep(1000)
    router.push('/company/our-organization')
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    submitLoading.value = false
  }
}

const handleChangeCheckbox = () => {
  const debtLimitInput = document.querySelector('.debtLimit')
  if (debtLimitInput) {
    debtLimitClasses.value = debtLimitClasses.value.filter((cls) => cls !== 'd-none')
    if (!form.value.haveCashbox) {
      debtLimitClasses.value.push('d-none')
      form.value.debtLimit = 0
    }
  }
}

const handleTaxPayerCheckbox = () => {
  if (form.value.isTaxpayer) {
    form.value.vat = 12
  } else {
    form.value.vat = 0
  }
}

const checkTin = () => {
  if (form.value.tin.length !== 9) {
    toast.warning(t('tin_length_need_9'))
  } else {
    checkVatTaxpayerStatus({ tin: form.value.tin })
      .then((res) => {
        checkTinLoading.value = true
        if (res.data.result.success) {
          form.value.isTaxpayer = true
          form.value.vat = 12
          toast.success(t('success_updated'))
          setTimeout(() => {
            isVatDisabled.value = true
          }, 300)
        } else {
          toast.error(t('messages.not_found'))
          form.value.isTaxpayer = false
          form.value.vat = 0
          isVatDisabled.value = false
        }
      })
      .catch((e) => {
        toast.error(getErrorMessage(e))
      })
      .finally(() => {
        checkTinLoading.value = false
      })
  }
}

const cancel = () => {
  router.push('/company/organization')
}

const uploadFile = async (e: any) => {
  try {
    const file = e.target.files[0]

    if (file) {
      form.value.files = file
      fileUrl.value = URL.createObjectURL(file)
    } else {
      toast.warning(t('select_file'))
    }
  } catch (error) {
    toast.error(getErrorMessage(e))
  }
}

const saveClassNames = () => {
  const debtInput = document.querySelector('.debtLimit')
  const hasCashBox = document.querySelectorAll('.cashboxInput')
  if (debtInput) {
    debtLimitClasses.value = debtInput.classList.value.split(' ') || []
  }
  if (hasCashBox) {
    cashBoxClasses.value = hasCashBox[0].classList.value.split(' ') || []
  }

  debtLimitClasses.value.push('d-none')
  cashBoxClasses.value.push('d-none')
}

// STARTER FUNCTION LIST

const fetchDataById = async () => {
  loading.value = true
  try {
    const {
      data: { result }
    } = await getCompanyData()
    form.value = result as any
    form.value.userFirstName = result.firstName
    form.value.userLastName = result.lastName
    form.value.userPosition = result.position
    form.value.login = result.userName
    form.value.userInn = result.inn
    form.value.userMiddleName = result.middleName

    fileUrl.value = form.value.files ? `${apiUrl}/${form.value.files}` : ''
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    loading.value = false
  }
}

const getStructureList = async () => {
  try {
    const { data } = await getStructureListWithoutFond()
    types.value = data.result
  } catch (e) {
    console.log('error', e)
  }
}

const getRegion = async () => {
  try {
    const {
      data: { result }
    } = await getRegionList()
    regions.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getDistrict = async () => {
  try {
    const {
      data: { result }
    } = await getDistrictList(Number(form.value.regionId))
    districts.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const fetchSuperVisorList = async () => {
  try {
    const {
      data: { result }
    } = await getSuperVisiourList()
    supervisorList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

watch(
  () => form.value.isTaxpayer,
  () => {
    isVatDisabled.value = !form.value.isTaxpayer
  }
)

watch(
  () => form.value.regionId,
  async () => {
    if (form.value.regionId) {
      await getDistrict()
    }
  }
)

onMounted(async () => {
  saveClassNames()
  await Promise.all([getStructureList(), getRegion(), fetchSuperVisorList(), fetchDataById()])
})
</script>

<style scoped></style>
