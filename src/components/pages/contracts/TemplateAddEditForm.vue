<template>
  <div class="add-form-drawer">
    <v-card>
      <v-form v-model="isValid" @submit.prevent="handleSubmit">
        <v-card-item>
          <v-row>
            <v-col cols="12" md="3">
              <base-input
                density="comfortable"
                v-model="form.name"
                :rules="[rules.required]"
                :placeholder="t('name')"
              ></base-input>
            </v-col>
            <v-col cols="12" md="3">
              <base-select
                  density="comfortable"
                  :rules="[rules.required]"
                  v-model="form.type"
                  :items="typeList"
                  item-title="name"
                  item-value="value"
                  :placeholder="t('type')"
                ></base-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-textarea
                v-model="form.comment"
                rows="1"
                auto-grow
                :placeholder="t('contract.comment')"
                density="comfortable"
              ></v-textarea>
            </v-col>
            <v-col cols="12" md="3">
              <base-document-input
                :label="t('load_contract')"
                :file="fileUrl"
                @clear-file="fileUrl = ''"
                @update:file="uploadFile"
              />
            </v-col>
          </v-row>
        </v-card-item>
        <div class="px-4 pb-4 d-flex justify-end ga-4">
          <base-button :loading="submitLoading" type="submit">
            {{ props.isEdit ? t('actions.edit') : t('add') }}
          </base-button>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import {
  //   createContract,
  //   geContractStructure,
  //   getContractById,
  //   updateContract,
  //   updateMyContract,
  //   createMyContract,
  //   getContractAbonentEvents,
  createTemplate
} from '@/services/contracts/contracts.service'
// import { CompanyDataDto, ContractsDto } from '@/services/contracts/dto/contracts.dto'
import { getErrorMessage, getFormData, sleep, capitalize } from '@/utils/functions'
import { useRules } from '@/utils/rules'
// import { useUserStore } from '@/stores/user.store'
// import { STRUCTURES } from '@/constants/structures'

const { t, locale } = useI18n()

const props = defineProps<{ isEdit?: boolean; isDialogVisible?: boolean; isFond?: boolean }>()
// const apiUrl = import.meta.env.VITE_API_URL

const rules = useRules()

interface CreateTemplateDto {
  name: string
  description: string
  comment: string
  document: any
  id: any
  filePath: any
  type: number
}

const typeList = ref([
  { name: t('privacyPolicyTemplate'), value: 1 },
  { name: t('publicOfferTemplate'), value: 2 },
])

const form = ref<CreateTemplateDto>({
  comment: '',
  id: undefined,
  document: undefined,
  filePath: undefined,
  type: 1,
  name: '',
  description: ''
})

// const userStore = useUserStore()
// const route: any = useRoute()
const router = useRouter()
// const structureList = ref<any>([])
// const abonentEventList = ref()
// const loading = ref<boolean>(false)
const submitLoading = ref<boolean>(false)
const fileUrl = ref('')

const isValid = ref(false)

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
  const formData = getFormData(form.value)
  try {
    await createTemplate(formData)
    toast.success(t('messages.added_success'))
    await sleep(1000)
    router.push('/contract/templates')
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  } finally {
    submitLoading.value = false
  }
}

// const fetchDataById = async () => {
//   loading.value = true
//   try {
//     const {
//       data: { result }
//     } = await getContractById(route.params.id)
//     form.value = result
//     fileUrl.value = form.value.filePath ? `${apiUrl}/${form.value.filePath}` : ''
//     if (!Array.isArray(form.value.document)) {
//       form.value.document = []
//     }
//   } catch (e) {
//     toast.error(getErrorMessage(e))
//   } finally {
//     loading.value = false
//   }
// }
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
