<template>
  <base-title :title="t('halls.building')" :back="true" />
  <v-card class="py-3">
    <v-card-item>
      <v-form ref="submitFormRef" @submit.prevent="addFile" v-model="isValid">
        <v-row>
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
            <BaseMaskInput v-model="create.phone" :placeholder="t('halls.phone')" :label="t('halls.phone')"
              :rules="[rules.required]" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="3">
            <label class="custom-time__label">{{ t('halls.startTime') }}</label>
            <div class="d-flex align-start">
              <input class="custom-time__picker" :placeholder="t('halls.name')" v-model="create.startWork"
                :rules="[rules.required]" type="time" />
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <label class="custom-time__label">{{ t('halls.endTime') }}</label>
            <div class="d-flex align-start">
              <input class="custom-time__picker" :rules="[rules.required]" :placeholder="t('halls.name')"
                v-model="create.endWork" type="time" />
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <label class="custom-time__label">{{ t('halls.description') }}</label>
            <v-textarea density="compact" v-model="create.content" rows="1"></v-textarea>
          </v-col>
          <v-col class="d-flex align-center" cols="12" md="3">
            <base-image-input accept="image/*" @clear-image="clearImg" @update:file="uploadImage"
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
            <base-button to="/palaces" color="red" class="mr-2">{{ t('close') }}</base-button>
            <base-button :loading="submitLoading" type="submit">{{ t('contract.menu.edit') }}</base-button>
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
                  <leaflet-map @update-location="getLocation" :latitude="create?.cordinataX"
                    :longitude="create?.cordinataY" />
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
import { updatePalace, getPalaceById } from '@/services/palace/palace.service'
import { PalaceCreateDto } from '@/services/palace/dto/palace.dto'
import { createAddImage } from '@/services/events/events.service'
import { useUserStore } from '@/stores/user.store'
import { toast } from 'vue3-toastify'
import { capitalize, getErrorMessage, sleep } from '@/utils/functions'
import { useServerError } from '@/services/useServerError'
import { useRules } from '@/utils/rules'

const apiUrl = import.meta.env.VITE_API_URL

const userStore = useUserStore()
const { getFieldErrors } = useServerError()
const { t, locale } = useI18n()
const uploadedImage = ref<File | null>(null)
const regionList = ref([])
const districtList = ref([])
const imgData = ref<any>({})
const rules = useRules()
const coordinate = ref<any>({})
const imageUrl = ref('')
const submitFormRef = ref<any>(null)
const submitLoading = ref(false)
const mapDialog = ref(false)
const router: any = useRouter()
const route: any = useRoute()
const isValid = ref(false)

definePage({
  meta: {
    permission: PERMISSIONS.PALACES
  }
})

const clearImg = () => {
  imgData.value = {}
  imageUrl.value = ''
}
onMounted(async () => {
  await userStore.getUser()
})
const data = ref()
const create = ref<PalaceCreateDto>({
  address: '',
  content: '',
  cordinataX: null,
  cordinataY: null,
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
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const addFile = async () => {
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
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const submit = async () => {
  if (!isValid.value) return

  create.value.photos = imgData.value.path
  create.value.orgId = String(userStore.user?.organizationId)
  create.value.structureId = String(userStore.user?.structureId)
  create.value.cordinataX = coordinate.value.lat
  create.value.cordinataY = coordinate.value.lng
  create.value.id = +route.params.id

  try {
    submitLoading.value = true
    await updatePalace(create.value)
    submitFormRef.value.reset()
    toast.success(t('contract.successfully'))
    await sleep(1000)
    router.push('/palaces')
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
const fetchData = async () => {
  try {
    const {
      data: { result }
    } = await getPalaceById(route.params.id)
    data.value = result

    imageUrl.value = data.value.photos ? ` ${apiUrl}/${data.value.photos}` : ''
    create.value = {
      address: data.value.address,
      content: data.value.content,
      cordinataX: data.value.cordinataX || 41.2995,
      cordinataY: data.value.cordinataY || 69.2401,
      districtId: data.value.districtId,
      endWork: data.value.endWork,
      name: data.value.name,
      orgId: data.value.orgId,
      phone: data.value.phone,
      photos: data.value.photos,
      regionId: data.value.regionId,
      startWork: data.value.startWork,
      structureId: data.value.structureId
    }
    imgData.value.path = data.value.photos
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

watch(
  [create],
  () => {
    console.log('create', create.value)
  },
  { deep: true }
)

onMounted(async () => {
  await Promise.all([fetchData(), getRegion()])
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

body.dark-theme .custom-time__picker {
  color: #fff;
}
</style>
