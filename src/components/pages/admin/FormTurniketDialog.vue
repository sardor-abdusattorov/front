<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <base-button v-bind="activatorProps">
          {{ t('add') }}
        </base-button>
      </template>
      <v-form ref="submitFormRef" @submit.prevent="submitHandler">
        <v-card :title="t('add')">
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <base-input :rules="[rules.required]" :label="t('login.login')" :placeholder="t('login.login')"
                  v-model="form.login" required></base-input>
              </v-col>

              <v-col cols="12" md="6">
                <base-select :rules="[rules.required]" v-model="form.palaceId" :items="palaceList"
                  :item-title="`name${capitalize(locale)}`" item-value="value" :label="t('sold_tickets.table.palace')"
                  :placeholder="t('sold_tickets.table.palace')"></base-select>
              </v-col>

              <v-col cols="12" md="6">
                <base-input v-model="form.password" :label="t('login.password')"
                  :placeholder="t('login.password')"></base-input>
              </v-col>

              <v-col cols="12" md="6">
                <base-select v-model="form.palaceHallList" :rules="[rules.required]" :items="hallList" item-value="id"
                  item-title="name" multiple :label="t('halls.establishmentsHalls')"
                  :placeholder="t('halls.establishmentsHalls')"></base-select>
              </v-col>

              <v-col cols="12">
                <base-input v-model="form.validationMinute" :rules="[rules.required]" :label="t('maxTimeSession')"
                  :placeholder="t('maxTimeSession')" type="number" required></base-input>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>
          <div class="d-flex justify-end ga-2 my-4 pr-6">
            <v-spacer></v-spacer>

            <base-button color="red" @click="dialog = false">{{ t('close') }}</base-button>

            <base-button :loading="submitLoading" type="submit" v-if="dataById"> {{ t('actions.edit') }}</base-button>
            <base-button :loading="submitLoading" type="submit" v-else> {{ t('add') }}</base-button>

          </div>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  createTurniketUser,
  getPalaceHallGetAll,
  getPalaceListByFond,
  getTurniketUserById,
  updateTurniketUser
} from '@/services/administration/admin.service'
import { toast } from 'vue3-toastify'
import { capitalize, getErrorMessage } from '@/utils/functions'
import { useServerError } from '@/services/useServerError'

const { getFieldErrors } = useServerError()

const rules = {
  required: (value: string) => !!value || 'Required.'
}
const loading = ref(false)
const submitLoading = ref(false)
const dialog = ref(false)
const dataById = ref()
const { t, locale } = useI18n()
const submitFormRef = ref()
const emit = defineEmits(['update:data'])
const FORM = {
  login: '',
  palaceHallList: [],
  palaceId: null,
  password: '',
  validationMinute: null
}

const open = (id: string) => {
  dataById.value = id
  dialog.value = true
  fetchDataById()
}

const hallList = ref([])
const form = ref(FORM)
const palaceList = ref([])
const resetForm = () => {
  form.value = { ...FORM }
  dataById.value = null
}
const loadData = async () => {
  try {
    const {
      data: { result }
    } = await getPalaceListByFond({})
    palaceList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const fetchHallList = async () => {
  if (form.value.palaceId === null) return
  try {
    const {
      data: { result }
    } = await getPalaceHallGetAll(form.value.palaceId)
    hallList.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

watch(
  () => form.value.palaceId,
  () => {
    if (form.value.palaceId) {
      fetchHallList()
    }
  }
)

// watch(
//   () => props.dataById,
//   (value) => {
//     if (value && dialog.value) {
//       fetchDataById()
//     }
//   }
// )

// watch(
//   () => props.dataById,
//   (value) => {
//     if (value) fetchDataById()
//   }
// )
// watch(
//   () => dialog.value,
//   (value) => {
//     dialog.value = value

//     if (value && props.dataById) {
//       fetchDataById()
//     }
//   }
// )
watch(
  () => dialog.value,
  (value) => {
    if (!value) {
      resetForm()
    }
  }
)
const fetchDataById = async () => {
  try {
    const {
      data: { result }
    } = await getTurniketUserById(Number(dataById.value))
    form.value = result
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}
const submitHandler = async () => {
  submitLoading.value = true

  try {
    if (dataById.value) {
      await updateTurniketUser({
        ...form.value,
      })
    } else {
      await createTurniketUser(form.value)
    }
    submitFormRef.value.reset()
    toast.success(t('contract.successfully'))
    dialog.value = false
    emit('update:data')
  } catch (error: any) {
    submitFormRef.value.setErrors(getFieldErrors(error))
    toast.error(getErrorMessage(error))
  } finally {
    submitLoading.value = false
  }
}

loadData()
defineExpose({
  open
})
</script>
