<template>
  <base-page-layout :isLoading="loading">
    <template #filter>
      <user-top-nav />
      <v-card class="pt-10">
        <v-card-item>
          <v-row class="my-2" v-if="userStore.user?.structureId !== STRUCTURES.TOUR_AGENT">
            <v-col cols="12" class="d-flex justify-end">
              <base-button color="primary" @click="router.push('roles/form')" outlined> {{ t('add') }}</base-button>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </template>
    <template #content>
      <base-table :tableHeader="tableHeader" :tableBody="tableBodyList" :is-loading="loading" :menuList="menuList"
        @clickMenuHandler="handleMenuClick" :pagination="{
          page: 0,
          total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            fetchData()
          }
        }"></base-table>
    </template>
  </base-page-layout>
</template>

<script setup lang="ts">
import type { TableHeaderTypes } from '@/types/table.types'
import { deleteRole, getRoleList } from '@/services/administration/admin.service'
import { AdminRoleDto } from '@/services/administration/dto/admin.dto'
import { PERMISSIONS } from '@/constants/permissions'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { STRUCTURES } from '@/constants/structures'
import { useUserStore } from '@/stores/user.store'
definePage({
  meta: {
    permission: PERMISSIONS.ADMINISTRATOR
  }
})

const { t } = useI18n()
const userStore = useUserStore()

const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('tariffs.table.action'),
    role: 'action',
    key: 'action',
    id: ''
  },
  {
    text: t('halls.name'),
    role: 'text',
    key: 'name',
    id: ''
  },
  {
    text: t('contract.comment'),
    role: 'text',
    key: 'comment',
    id: ''
  }
])
const tableBodyList = ref<AdminRoleDto[]>([])
const totalNumber = ref<number | undefined>(0)
const currentPage = ref(0)

const router = useRouter()
const itemsPerPage = ref(10)
const loading = ref(false)
const menuList = ref([
  { id: 1, name: t('tariffs.menu.edit') },
  { id: 2, name: t('tariffs.menu.delete') }
])

const handleMenuClick = (item: { nameId: number; id: number }) => {
  if (item.nameId === 1) {
    router.push(`/admin/roles/edit/${item.id}`)
  } else if (item.nameId === 2) {
    handleDelete(item.id)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { data, total }
      }
    } = await getRoleList({
      skip: currentPage.value,
      take: itemsPerPage.value
    })
    tableBodyList.value = data
    totalNumber.value = total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}
const handleDelete = async (id: number) => {
  try {
    await deleteRole(id)
    toast.success(t('successDeleted'))
    fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

fetchData()
</script>

<style scoped lang="scss">
.custom-user {
  position: relative;

  &__card {
    display: flex;
    gap: 20px;
    position: absolute;
    top: -10px;
    right: 15px;
    left: 15px;
    width: calc(100% - 30px);
    background-image: linear-gradient(to left, #0dcec9 0, #7e54c2 100%);
    border-radius: 3px;
    padding: 10px;
    z-index: 1;
  }
}
</style>
