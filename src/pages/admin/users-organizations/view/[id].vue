<template>
  <base-title :title="t('actions.view')" :back="true" />
  <div class="custom-user">
    <div class="add-form-drawer">
      <v-card>
        <v-form ref="submitFormRef" @submit.prevent="handleSubmit">
          <v-card-item>
            <v-row>
              <v-col cols="12" md="3">
                <base-input :disabled="true" class="cursor-not-allowed" :rules="[rules.required]"
                  v-model="form.firstName" :placeholder="t('user.firstName')" :label="t('user.firstName')"></base-input>
              </v-col>
              <v-col cols="12" md="3">
                <base-input :disabled="true" class="cursor-not-allowed" v-model="form.lastName"
                  :rules="[rules.required]" :placeholder="t('user.lastName')" :label="t('user.lastName')"></base-input>
              </v-col>
              <v-col cols="12" md="3">
                <base-input :disabled="true" class="cursor-not-allowed" v-model="form.email"
                  :rules="[rules.required, rules.emailRules]" type="email" :placeholder="t('user.mail')"
                  :label="t('user.mail')"></base-input>
              </v-col>
              <v-col cols="12" md="3">
                <base-input :disabled="true" class="cursor-not-allowed" v-model="form.login" :rules="[rules.required]"
                  :placeholder="t('login.login')" :label="t('login.login')"></base-input>
              </v-col>
              <v-col cols="12" md="3">
                <base-input :disabled="true" class="cursor-not-allowed" v-model="form.middleName"
                  :rules="[rules.required]" :placeholder="t('user.middleName')"
                  :label="t('user.middleName')"></base-input>
              </v-col>
              <v-col cols="12" md="3">
                <BaseMaskInput :disabled="true" class="cursor-not-allowed" :rules="[rules.required]"
                  v-model="form.telefon" :placeholder="t('halls.phone')" :label="t('halls.phone')" />
              </v-col>
              <v-col cols="12" md="3">
                <base-input :disabled="true" class="cursor-not-allowed" :rules="[rules.required]"
                  v-model="form.password" :placeholder="t('login.password')" :label="t('login.password')"></base-input>
              </v-col>
              <v-col cols="12" md="3">
                <base-select :disabled="true" class="cursor-not-allowed" v-if="!form.isKassir" :rules="[rules.required]"
                  v-model="roleForm.roleId" :items="rolesList" item-title="name" item-value="id"
                  :placeholder="t('user.roles')" :label="t('user.roles')"></base-select>
                <base-select :disabled="true" class="cursor-not-allowed" v-if="form.isKassir" :rules="[rules.required]"
                  v-model="form.palaceId" :items="palaceList" item-title="text" item-value="value"
                  :label="t('events.palace')" :placeholder="t('events.palace')"></base-select>
              </v-col>
              <v-col cols="12" md="3">
                <base-image-input :disabled="true" class="cursor-not-allowed mt-1" accept="image/*"
                  @clear-image="imageUrl = ''" @update:file="uploadImage" :label="t('user_image')" :image="imageUrl"
                  density="compact" />
              </v-col>
              <v-col cols="6" md="2" class="d-flex">
                <v-checkbox :disabled="true" class="cursor-not-allowed" v-model="form.active" :label="t('active')"
                  hide-details color="indigo"></v-checkbox>
              </v-col>
              <v-col cols="6" md="2">
                <v-checkbox :disabled="true" class="cursor-not-allowed" v-model="form.isKassir"
                  :label="t('report.reportsTicket.cashier')" color="indigo" hide-details></v-checkbox>
              </v-col>
            </v-row>
          </v-card-item>
        </v-form>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getRoles } from '@/services/contracts/contracts.service'
import { useServerError } from '@/services/useServerError'
import { toast } from 'vue3-toastify'
import { PERMISSIONS } from '@/constants/permissions'
import { getErrorMessage, sleep } from '@/utils/functions'
import { getOtherUserById, getUserRoleId, updateUser } from '@/services/administration/admin.service'
import { CreateUserFormDto, userRoleDto } from '@/services/administration/dto/admin.dto'
import { getRegionPalaceList } from '@/services/report-region/report-region.service'
import { createAddImage } from '@/services/events/events.service'
import { useRules } from '@/utils/rules'

const { getFieldErrors } = useServerError()
const { t } = useI18n()
const apiUrl = import.meta.env.VITE_API_URL

definePage({
  meta: {
    permission: PERMISSIONS.ORGANIZATION
  }
})

const rules = useRules()
const FORM: CreateUserFormDto = {
  firstName: '',
  lastName: '',
  middleName: '',
  telefon: '',
  isKassir: false,
  email: '',
  login: '',
  password: '',
  active: false,
  palaceId: null,
  isAdmin: true,
  photo: ''
}
const roleForm = ref<userRoleDto>({
  id: 0,
  roleId: null,
  userId: 0
})

const uploadedImage = ref<File | null>(null)
const route = useRouter()
const form = ref(FORM)
const submitLoading = ref<boolean>(false)
const imageUrl = ref('')
const submitFormRef = ref()
const rolesList = ref<any[]>([])
const loading = ref(false)
const palaceList = ref([])
const imgData = ref<any>(null)
const router: any = useRoute()
const uploadImage = async (e: any) => {
  try {
    const image = e.target.files[0]
    if (image) {
      if (!image.type.startsWith("image/") || image.type.startsWith("image/svg")) {
        toast.warning(t("select_valid_image"))
        return;
      }
      uploadedImage.value = image
      form.value.photo = image
      imageUrl.value = URL.createObjectURL(image)
      await addFile()
    } else {
      console.log('No file selected')
    }
  } catch (error) {
    console.log('Error during file upload:', error)
  }
}
const addFile = async () => {
  if (uploadedImage.value) {
    const formData = new FormData()
    formData.append('field', 'eventbannerfiles')
    formData.append('files', uploadedImage.value)
    try {
      const {
        data: { result }
      } = await createAddImage(formData)
      imgData.value = result
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }
}
const handleSubmit = async () => {
  const validate = await submitFormRef.value.validate()
  if (validate && validate.valid) {
    submitLoading.value = true
    if (imgData.value) {
      form.value.photo = imgData.value.path
    }
    try {
      await updateUser(form.value)
      if (form.value.isKassir === false) {
        // await updateUserRole(roleForm.value)
      }
      submitFormRef.value.reset()
      toast.success(t('contract.successfully'))
      await sleep(1500)
      route.push('/admin/users')
    } catch (error: any) {
      submitFormRef.value.setErrors(getFieldErrors(error))
    } finally {
      submitLoading.value = false
    }
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: { result }
    } = await getRoles()
    rolesList.value = result
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
    } = await getRegionPalaceList()
    palaceList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const loadById = async () => {
  try {
    const {
      data: { result }
    } = await getOtherUserById(Number(router.params.id))
    form.value = result
    imageUrl.value = result.photo ? ` ${apiUrl}/${result.photo}` : ''
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
const loadRoleById = async () => {
  try {
    const {
      data: { result }
    } = await getUserRoleId(Number(router.params.id))
    if (result[0]) {
      roleForm.value = result[0]
    }
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}
onMounted(async () => {
  await Promise.all([loadData(), fetchData(), loadById(), loadRoleById()])
})
</script>

<style scoped lang="scss">
.form-group label {
  font-size: 14px;
  line-height: 1.42857;
  color: #aaa;
  font-weight: 400;
}

.form-group select input {
  border-radius: 50px;
}

.custom-user {
  position: relative;
  margin-bottom: 30px;

  &__card {
    display: flex;
    gap: 20px;
    position: absolute;
    top: 10px;
    right: 15px;
    left: 15px;
    width: 98%;
    background-image: linear-gradient(to left, #0dcec9 0, #7e54c2 100%);
    border-radius: 3px;
    margin-top: -10px;
    padding: 10px;
    z-index: 1;
  }
}
</style>
