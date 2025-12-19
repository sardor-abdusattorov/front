<template>
  <base-title :title="t('halls.building')" :back="true" />
  <v-card class="py-3">
    <v-card-item>
      <v-form ref="submitFormRef" @submit.prevent="addFile" v-model="formIsValid">
        <v-row>
          <v-col cols="12" md="3" v-if="userStore.user?.structureId === STRUCTURES.FOND">
            <base-select :label="t('contract.structure')" v-model="create.structureId" :items="structureList"
              :rules="[rules.required]" item-value="value" :item-title="`name${capitalize(locale)}`"
              :multiple="false"></base-select>
          </v-col>
          <v-col cols="12" md="3" v-if="userStore.user?.structureId === STRUCTURES.FOND">
            <base-select :label="t('contracts.organization')" v-model="create.orgId" :items="organizator"
              :rules="[rules.required]" item-value="value" item-title="text" :multiple="false"></base-select>
          </v-col>
          <v-col cols="12" md="3">
            <base-select :label="t('halls.region')" v-model="create.regionId" :items="regionList" item-value="id"
              :item-title="'name' + capitalize(locale)" :multiple="false"
              :placeholder="t('halls.region')"></base-select>
          </v-col>
          <v-col cols="12" md="3">
            <base-select :label="t('halls.area')" :items="districtList" v-model="create.districtId" item-value="id"
              :item-title="'name' + capitalize(locale)" :placeholder="t('halls.area')"></base-select>
          </v-col>
          <v-col cols="12" md="3">
            <base-input :rules="[rules.required]" :placeholder="t('halls.name')" v-model="create.name"
              :label="t('halls.name')"></base-input>
          </v-col>
          <v-col cols="12" md="3">
            <BaseMaskInput :rules="[rules.required]" v-model="create.phone" :placeholder="t('halls.phone')"
              :label="t('halls.phone')" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="3">
            <label class="custom-time__label">{{ t('halls.startTime') }}</label>
            <div class="d-flex align-start">
              <input class="custom-time__picker" :placeholder="t('halls.name')" v-model="create.startWork"
                type="time" />
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <label class="custom-time__label">{{ t('halls.endTime') }}</label>
            <div class="d-flex align-start">
              <input class="custom-time__picker" :placeholder="t('halls.name')" v-model="create.endWork" type="time" />
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <label class="custom-time__label">{{ t('halls.description') }}</label>
            <v-textarea :rules="[rules.required]" density="compact" v-model="create.content" rows="1"></v-textarea>
          </v-col>
          <v-col class="d-flex align-end" cols="12" md="3">
            <base-image-input accept="image/*" @clear-image="imageUrl = ''" @update:file="uploadImage"
              :label="t('halls.palace_image')" :image="imageUrl" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="3">
            <v-textarea :rules="[rules.required]" density="compact" v-model="create.address" rows="1"
              :label="t('halls.address')"></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="3" class="d-flex align-end">
            <base-button to="/palaces" color="red">{{ t('close') }}</base-button>
            <base-button :loading="submitLoading" type="submit" class="ml-2">{{ t('add') }}</base-button>
          </v-col>
          <v-col cols="12" md="9" class="d-flex justify-end">
            <v-dialog max-width="60vw" v-model="mapDialog">
              <template v-slot:activator="{ props: activatorProps }">
                <base-button v-bind="activatorProps">
                  <v-icon class="pr-3" icon="mdi-eye"></v-icon>
                  {{ t('halls.location') }}
                </base-button>
              </template>
              <v-card>
                <v-card-item>
                  <leaflet-map @update-location="getLocation" :latitude="create.cordinataX as number"
                    :longitude="create.cordinataY as number" />
                </v-card-item>
              </v-card>
            </v-dialog>
          </v-col>
        </v-row>
      </v-form>
    </v-card-item>
  </v-card>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { PERMISSIONS } from '@/constants/permissions'
import { getDistrictList, getRegionList } from '@/services/report-region/report-region.service'
import { createPalace } from '@/services/palace/palace.service'
import { PalaceCreateDto } from '@/services/palace/dto/palace.dto'
import { createAddImage } from '@/services/events/events.service'
import { useUserStore } from '@/stores/user.store'
import { toast } from 'vue3-toastify'
import { capitalize, getErrorMessage, sleep } from '@/utils/functions'
import { getCompanyListByStructureId, getStructureListForPalace } from '@/services/organization/organization.service'
import { useServerError } from '@/services/useServerError'
import { useRules } from '@/utils/rules'
import { STRUCTURES } from '@/constants/structures'

const formIsValid = ref(false)

const userStore = useUserStore()
const { getFieldErrors } = useServerError()
const { t, locale } = useI18n()
const uploadedImage = ref<File | null>(null)
const regionList = ref([])
const districtList = ref([])
const imgData = ref<any>({})
const mapDialog = ref(false)
const rules = useRules()
const coordinate = ref<any>({})
const imageUrl = ref('')
const submitFormRef = ref<any>(null)
const submitLoading = ref(false)
const organizator = ref<any>([])
const structureList = ref<any>([])

const route = useRouter()
definePage({
  meta: {
    permission: PERMISSIONS.PALACES
  }
})
onMounted(async () => {
  await userStore.getUser()
})
const create = ref<PalaceCreateDto>({
  address: '',
  content: '',
  cordinataX: 41.31135967927931,
  cordinataY: 69.27942460601932,
  districtId: null,
  endWork: null,
  name: '',
  orgId: '',
  phone: '',
  photos: '',
  regionId: null,
  startWork: null,
  structureId: ''
})
const uploadImage = async (e: any) => {
  try {
    const image = e.target.files[0]
    if (image) {
      if (!image.type.startsWith("image/") || image.type.startsWith("image/svg")) {
        toast.warning(t("select_valid_image"))
        return;
      }
      uploadedImage.value = image
      create.value.photos = image
      imageUrl.value = URL.createObjectURL(image)
    } else {
      console.log('No file selected')
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const addFile = async () => {
  if (!formIsValid.value) return
  if (!uploadedImage.value) {
    return submit()
  }
  const formData = new FormData()
  formData.append('field', 'palacephotofiles')
  formData.append('files', uploadedImage.value)

  try {
    const {
      data: { result }
    } = await createAddImage(formData)
    imgData.value = result
    submit()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}
const submit = async () => {
  create.value.photos = imgData.value.path
  if (userStore.user?.structureId !== STRUCTURES.FOND) {
    create.value.structureId = String(userStore.user?.structureId)
    create.value.orgId = String(userStore.user?.organizationId)
  }
  // create.value.orgId = String(userStore.user?.organizationId)
  // create.value.structureId = String(userStore.user?.structureId)
  create.value.cordinataX = coordinate.value.lat
  create.value.cordinataY = coordinate.value.lng
  if (!create.value.startWork) {
    delete create.value.startWork;
  }
  if (!create.value.endWork) {
    delete create.value.endWork
  }
  try {
    submitLoading.value = true
    await createPalace(create.value)
    submitFormRef.value.reset()
    toast.success(t('contract.successfully'))
    await sleep(1000)
    route.push('/palaces')
  } catch (e: any) {
    toast.error(getErrorMessage(e))
    submitFormRef.value.setErrors(getFieldErrors(e))
  } finally {
    submitLoading.value = false
  }
}
const getRegion = async () => {
  try {
    const {
      data: { result }
    } = await getRegionList()
    regionList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const getDistrict = async () => {
  try {
    const {
      data: { result }
    } = await getDistrictList(Number(create.value.regionId))
    districtList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getStructureListAbonent = async () => {
  try {
    const {
      data: { result }
    } = await getStructureListForPalace()
    structureList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getCompanyListBYSTRUCTURE = async (structureId: number) => {
  try {
    const {
      data: { result }
    } = await getCompanyListByStructureId({ structureId })
    organizator.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

watch(
  () => create.value.structureId,
  async () => {
    if (create.value.structureId) {
      await getCompanyListBYSTRUCTURE(Number(create.value.structureId))
    } else {
      organizator.value = []
      create.value.orgId = ''
    }
  }
)

watch(
  () => create.value.regionId,
  async () => {
    if (create.value.regionId) {
      await getDistrict()
    }
  }
)
const getLocation = (val: any) => {
  coordinate.value = val
  create.value.cordinataX = val.lat
  create.value.cordinataY = val.lng
  mapDialog.value = false
}

onMounted(async () => {
  await Promise.all([getRegion(), getStructureListAbonent()])
})
</script>

<style lang="scss" scoped>
.custom-time__picker {
  width: 100%;
  padding: 0.5rem;
  border-bottom: 1px solid #c4c4c4;
  background: rgba(159, 157, 157, 0.07);
  font-size: 14px;
  color: #000;

  &:focus {
    outline: none;
  }
}

.custom-time__label {
  font-size: 12px;
  color: #000;
  font-weight: 500;
}

body.dark-theme .custom-time__label {
  color: #fff;
}
</style>
