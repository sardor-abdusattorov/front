<template>
  <base-title :title="t('user.role_edit')" :back="true" />
  <v-card class="pt-14">
    <v-card-item>
      <v-form ref="submitFormRef" @submit.prevent="onsubmit">
        <v-row class="my-2">
          <v-col md="6" cols="12">
            <base-input v-model="form.name" :rules="[rules.required]" :label="t('halls.name')" required></base-input>
          </v-col>
        </v-row>
        <v-row class="my-2">
          <v-col md="6" class="d-flex justify-space-between align-center" cols="12">
            <v-card-text>{{ t('accesses') }}</v-card-text>
            <base-select
              multiple
              style="width: 500px"
              :items="permissionList"
              item-value="id"
              :label="t('permissions')"
              :placeholder="t('permissions')"
              item-title="name"
              v-model="permissionIds"
              :rules="[rules.required]"
              required
            ></base-select>
          </v-col>
        </v-row>
        <v-row class="my-2">
          <v-col cols="12" class="d-flex ga-3">
            <base-button color="red" @click="router.push('/admin/roles')" outlined> {{ t('cancel') }}</base-button>
            <base-button :loading="submitLoading" color="primary" type="submit" outlined>
              {{ t('tariffs.menu.edit') }}</base-button
            >
          </v-col>
        </v-row>
      </v-form>
    </v-card-item>
  </v-card>
</template>

<script setup lang="ts">
import { PERMISSIONS } from '@/constants/permissions'
import { useI18n } from 'vue-i18n'
import {
  createRole,
  deleteRolePermission,
  getAllPermission,
  getPermissionListById,
  getRolePermission,
  updateRoleName
} from '@/services/administration/admin.service'
import { toast } from 'vue3-toastify'
import { createRoleFormDto } from '@/services/administration/dto/admin.dto'
import { getErrorMessage, sleep } from '@/utils/functions'
import { useServerError } from '@/services/useServerError'
import { useRules } from '@/utils/rules'

const { getFieldErrors } = useServerError()
const { t } = useI18n()
interface Role {
  id: number
  permissionId: number
}
definePage({
  meta: {
    permission: PERMISSIONS.ADMINISTRATOR
  }
})
const submitFormRef = ref()
const rules = useRules()
const route: any = useRoute()
const router = useRouter()
const submitLoading = ref(false)
const permissionList = ref<createRoleFormDto[]>([])
const permissionIds = ref<number[]>([])
const form = ref({
  name: '',
  id: route.params.id
})

const deleteItems = ref<any>()
const roleIds = ref<Role[]>([])
const formPermission = ref<createRoleFormDto[]>([])
const fetchData = async () => {
  try {
    const {
      data: { result }
    } = await getAllPermission()
    permissionList.value = result
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  }
}
const loadById = async () => {
  try {
    const {
      data: { result }
    } = await getRolePermission(route.params.id)
    form.value.name = result.name
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  }
}
const permissionById = async () => {
  try {
    const {
      data: { result }
    } = await getPermissionListById(route.params.id)
    permissionIds.value = result.map((permission: any) => permission.permissionId)
    roleIds.value = result.map((role: any) => ({
      id: role.id,
      permissionId: role.permissionId
    }))
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  }
}
const onsubmit = async () => {
  const validate = await submitFormRef.value.validate()
  if (validate && validate.valid) {
    submitLoading.value = true
    deleteItems.value = roleIds.value.filter((item: Role) => !permissionIds.value.includes(item.permissionId))
    try {
      await updateRoleName(form.value)
      for (const item of deleteItems.value) {
        await deleteRolePermission(item.id)
      }
      if (formPermission.value.length > 0) {
        await createRole(formPermission.value)
      }
      toast.success(t('contract.successfully'))
      await sleep(1000)
      router.push('/admin/roles')
      submitFormRef.value.reset()
    } catch (error: any) {
      toast.error(getErrorMessage(error))
      submitFormRef.value.setErrors(getFieldErrors(error))
    } finally {
      submitLoading.value = false
    }
  }
}
watch(
  () => permissionIds.value,
  (newVal: number[], oldVal: number[]) => {
    const removedPermissions = oldVal.filter((id) => !newVal.includes(id))
    removedPermissions.forEach((removedId) => {
      const index = formPermission.value.findIndex((permission) => permission.permissionId === removedId)
      if (index !== -1) {
        formPermission.value.splice(index, 1)
      }
    })

    const addedPermissions = newVal.filter((id) => !oldVal.includes(id))
    addedPermissions.forEach((addedId) => {
      const exists = formPermission.value.some((permission) => permission.permissionId === addedId)
      if (!exists) {
        formPermission.value.push({ id: 0, roleId: route.params.id, permissionId: addedId })
      }
    })
  }
)
onMounted(async () => {
  await Promise.all([fetchData(), loadById(), permissionById()])
})
</script>

<style scoped lang="scss">
.custom-user {
  position: relative;

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
