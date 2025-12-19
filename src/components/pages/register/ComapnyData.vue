<template>
  <div class="registerPage ">
    <v-card class="registerCompany">
      <v-form v-model="isValid" @submit.prevent="openOfferModal">
        <v-row>
          <v-col cols="12" md="6">
            <base-input :label="t('contracts.organization')" type="text" density="compact"
              v-model="organizationData.organizationName" :disabled="true" />
          </v-col>
          <v-col cols="12" md="6">
            <base-input :label="t('contract.businesscategory')" type="text" density="compact"
              v-model="organizationData.businesscategory" :disabled="true" />
          </v-col>
          <v-col cols="12" md="4">
            <base-input :label="t('contract.tinOrganization')" :disabled="true" type="text" density="compact"
              v-model="form.tin" />
          </v-col>

          <v-col cols="12" md="4">
            <base-input :label="t('halls.address')" type="text" density="compact" v-model="organizationData.address"
              :disabled="true" />
          </v-col>

          <v-col cols="12" md="4">
            <base-input :label="t('sold_tickets.table.pinfl')" type="text" density="compact"
              v-model="organizationData.pinfl" :disabled="true" />
          </v-col>

          <v-col cols="12" md="4">
            <base-input :label="t('user.userLastName')" :rules="[rules.required]" type="text" density="compact"
              v-model="form.userLastName" :disabled="true" />
          </v-col>
          <v-col cols="12" md="4">
            <base-input :label="t('user.userFirstName')" :rules="[rules.required]" type="text" density="compact"
              v-model="form.userFirstName" :disabled="true" />
          </v-col>

          <v-col cols="12" md="4">
            <base-input :label="t('user.position')" :rules="[rules.required]" type="text" density="compact"
              v-model="form.userPosition" />
          </v-col>

          <v-col cols="12" md="4">
            <base-input :label="t('licenseNumber')" type="text" density="compact" v-model="form.licenseNumber"
              :rules="[rules.required]" />
          </v-col>

          <!-- User STIR -->
          <v-col cols="12" md="4">
            <base-mask-input :label="t('user.userInn')" :options="{
              mask: '#########'
            }" type="number" density="compact" disabled v-model="form.userInn"
              :rules="[rules.required, rules.innRule]">
            </base-mask-input>
          </v-col>

          <v-col cols="12" md="4">
            <base-select :rules="[rules.required]" v-model="form.regionId" :items="regions"
              :item-title="`name${capitalize(locale)}`" item-value="value" :label="t('region')"></base-select>
          </v-col>
          <v-col cols="12" md="4">
            <base-select :rules="[rules.required]" v-model="form.districtId" :items="districts"
              :item-title="`name${capitalize(locale)}`" item-value="id" :label="t('district')"></base-select>
          </v-col>


          <v-col cols="12" md="4">
            <BaseMaskInput :rules="[rules.required, rules.phoneRule]" v-model="form.telefon"
              :label="t('halls.phone')" />
          </v-col>

          <v-col cols="12" sm="4">
            <base-input density="compact" :rules="[rules.required, rules.emailRules]" :label="t('user.email')"
              v-model="form.email"></base-input>
          </v-col>

          <v-col cols="12" sm="4">
            <base-input density="compact" :rules="[rules.required, rules.rulesWebsite]" :label="t('user.website')"
              v-model="form.webSite"></base-input>
          </v-col>
          <!--
          <v-col cols="12" md="4">
            <base-input :label="t('login.login')" :rules="[rules.required]" type="text" density="compact"
              v-model="form.login">
            </base-input>
          </v-col> -->
          <v-col cols="12" md="4">
            <base-input :label="t('login.password')" :rules="[rules.required]" type="password" density="compact"
              v-model="form.password">
            </base-input>
          </v-col>
          <v-col cols="12" md="4">
            <base-input :label="t('login.confirm_password')" type="password" :rules="[rules.required, passwordMatch]"
              density="compact" v-model="form.confirmPassword">
            </base-input>
          </v-col>
          <v-col cols="12" md="12" class="d-flex justify-end">
            <base-button :loading="submitLoading" type="submit" >{{ t('send') }}</base-button>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
    <SuccessDialog ref="dialog" :login="form.login" :password="form.password" />
    <v-dialog v-model="offerModal" width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ t('publicOffer') }}</span>
        </v-card-title>
        <v-card-text>
          <iframe :src="pdfUrl" width="100%" height="500px" frameborder="0"></iframe>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="downloadOffer">{{ t('tickets.download') }}</v-btn>
          <v-btn @click="handleSubmit">{{ t('contract.menu.sign') }}</v-btn>
          <v-btn color="red" @click="offerModal = false">{{ t('close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { getDistrictListNotAuth, getRegionListNotAuth } from '@/services/report-region/report-region.service'
import { useRegisterOrganizationStore } from '@/stores/register-organization.store'
import { capitalize, getErrorMessage, sleep } from '@/utils/functions'
import { useRules } from '@/utils/rules'
import { toast } from 'vue3-toastify'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { RegisterDto } from '@/services/auth/dto/auth.dto'
import { getActiveContractTemplateFile } from '@/services/contracts/contracts.service'
import { useEimzo } from '@/composables/useEimzo'
import { downloadBlobAsFile } from '@/utils/functions'
import {
  getContractTemplateContractSign,
  PutContractTemplateSign
} from '@/services/contracts/contracts.service'
import { ESignKey } from '@shohrux_saidov/eimzo-client'
import Cookies from 'universal-cookie'
import { authService } from '@/services/auth/auth.service'


const { organizationData, selectedKey } = useRegisterOrganizationStore()
const { t, locale } = useI18n()
const { getHashESign, loadKey } = useEimzo()
const store = useAuthStore()
const rules = useRules()

const form = ref<RegisterDto>({
  name: organizationData.organizationName,
  organizationName: organizationData.organizationName,
  userFullName: organizationData.director,
  tin: Number(organizationData.orgTin),
  regionId: '',
  districtId: '',
  login: '',
  password: '',
  confirmPassword: '',
  userLastName: organizationData.surname,
  userFirstName: organizationData.name,
  userPosition: 'Direktor',
  userInn: organizationData.directorTin,
  userMiddleName: '',
  email: '',
  telefon: '',
  webSite: '',
  address: organizationData.address,
  userPINFL: organizationData.pinfl,
  licenseNumber: '',
  dsKeyNumber: selectedKey?.name as string,
  dsKeySerial: selectedKey?.serialNumber as string
})
const submitLoading = ref(false)
const regions = ref([])
const districts = ref([])
const isValid = ref(false)
const dialog = ref()
const signData = ref()
const offerModal = ref(false)
const offerBlob = ref()
const pdfUrl = ref('')
const isUserRegisteredBefore = ref(false)

const getExistingAccount = async (tin: number) => {
  const { result } = await store.getExistingAccount(tin)

  if(result) {
    signData.value = result.edsInfo
    isUserRegisteredBefore.value = true
    form.value.regionId = result.regionId
    await getDistrict()
    form.value.login = result.login
    form.value.email = result.email
    form.value.districtId = result.districtId
    form.value.telefon = result.telefon
    form.value.webSite = result.webSite
    form.value.licenseNumber = result.licenseNumber
    form.value.userMiddleName = result.userMiddleName
  }
}

getExistingAccount(form.value.tin)

const getRegion = async () => {
  try {
    const {
      data: { result }
    } = await getRegionListNotAuth()
    regions.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getDistrict = async () => {
  try {
    const {
      data: { result }
    } = await getDistrictListNotAuth(Number(form.value.regionId))
    districts.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const openOfferModal = async () => {
  if (!isValid.value) return
    try {
    submitLoading.value = true
    const response = await getActiveContractTemplateFile({
      type: 2,
      tin: form.value.tin,
      email: form.value.email,
      address: form.value.address,
      organizationName: form.value.organizationName,
      userFullName: form.value.userFullName,
    })
    offerBlob.value = response.data
    const blob = response.data
    pdfUrl.value = URL.createObjectURL(blob)
    offerModal.value = true
  } catch (error) {
    console.error('Error fetching the PDF:', error)
  } finally {
    submitLoading.value = false
  }


}

const downloadOffer = () => {
  downloadBlobAsFile(offerBlob.value, 'sign.pdf')
}

const signContract = async () => {
  console.log('SING DATA', signData.value)
  if (!selectedKey || !signData.value) return


  const myHash = await getHashESign(selectedKey, signData.value.signToHash)
  const pairs = selectedKey.alias.split(',')
  const result: any = {}
  console.log('MY HASH', myHash)
  if (!myHash?.hash) return

  pairs.forEach((pair: string) => {
    const [key, value] = pair.split('=')
    result[key.trim()] = value.trim().toUpperCase()
  })

  let model = {
    contractId: signData.value.contractEDSInfoModel.id,
    signToHash: myHash?.hash,
    organizationName: selectedKey.O,
    fullName: selectedKey.CN,
    address: `${result.st ? result.st : ''}, ${result.l ? result.l : ''}`,
    password: form.value.password,
    position: form.value.userPosition,
    licenseNumber: form.value.licenseNumber,
    regionId: form.value.regionId,
    districtId: form.value.districtId,
    telefon: form.value.telefon,
    email: form.value.email,
    webSite: form.value.webSite
  }

  try {
    await PutContractTemplateSign(model)
    await sleep(1000)
    dialog.value.openDialog()
    toast.success(t('contract.successfully'))
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const handleSubmit = async () => {
  if (!isValid.value) return

  try {
    form.value.login = form.value.email
    if(!isUserRegisteredBefore.value && !signData.value) {
    const data = await store.register(form.value as RegisterDto)
    signData.value = data.result
    }
    await signContract()
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const passwordMatch = (v: string) => {
  if (v === form.value.password) {
    return true
  } else {
    return 'Пароли не совпадают'
  }
}

watch(
  () => form.value.regionId,
  () => {
    if (form.value.regionId) {
      getDistrict()
    } else {
      districts.value = []
      form.value.districtId = ''
    }
  }
)


onMounted(async () => {
  await Promise.all([getRegion()])
})
</script>

<style scoped lang="scss">
.registerPage {
  padding: 12px;
  width: 100vw;
  height: 100vh;
  overflow: auto;
}

.registerCompany {
  margin: auto;
  z-index: 10;
  padding: 20px;
  width: 900px;

  @media screen and (max-width: 1200px) {
    width: 800px;
  }

  @media screen and (max-width: 992px) {
    width: 700px;
  }

  @media screen and (max-width: 768px) {
    width: 600px;
  }

  @media screen and (max-width: 576px) {
    width: 100%;
  }
}
</style>
