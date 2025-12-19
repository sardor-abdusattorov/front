<template>
  <base-page-layout :is-loading="isFetching">
    <template #filter>
      <div class="custom-user">
        <div class="custom-user__card">
          <base-button variant="text" :prepend-icon="User" to="/admin/users-organizations">
            {{ t('user.users') }}
          </base-button>
        </div>
        <v-card class="pt-8">
          <v-card-item class="mt-2">
            <v-row>
              <v-col cols="12" md="3">
                <base-select
                  label=""
                  :placeholder="t('report.returnedTicket.organization')"
                  :items="organizationList"
                  v-model="companyId"
                />
              </v-col>
              <v-col cols="12" md="3">
                <base-select
                  label=""
                  :placeholder="t('report.statisticsTicket.activity')"
                  :items="isActiveType"
                  v-model="filter.isActive"
                />
              </v-col>
              <v-col cols="12" md="3">
                <base-select
                  label=""
                  :placeholder="t('report.reportsTicket.cashier')"
                  :items="isCashDeskActiveType"
                  v-model="filter.isCashDeskActive"
                />
              </v-col>
              <v-col cols="12" md="3">
                <base-input v-model="filter.searchText" :placeholder="t('contract.search')" />
              </v-col>
            </v-row>
          </v-card-item>
        </v-card>
      </div>
    </template>
    <template #content>
      <base-table
        :key="tableKey"
        :table-header="tableHeader"
        :tableBody="userList"
        :is-loading="isFetching"
        :menu-list="menuList"
        @click-menu-handler="handleClickMenu"
        :pagination="{
          page: 0,
          total: Math.ceil(totalNumber ? totalNumber / 10 : 0),
          pageClickHandler: (page: number) => {
            currentPage = page - 1
            getOtherUserList()
          }
        }"
      >
      </base-table>
    </template>
  </base-page-layout>
</template>

<script setup lang="ts">
import User from '@/assets/icons/user-svgrepo.svg'
import { PERMISSIONS } from '@/constants/permissions'
import { getCompanyAllList } from '@/services/organization/organization.service'
import { useI18n } from 'vue-i18n'
import { OtherUserPageData } from '@/services/administration/model/admin.model'
import { changeUserStatus, getAllOtherUserList } from '@/services/administration/admin.service'
import type { TableActionListType, TableHeaderTypes } from '@/types/table.types'
import { ref } from 'vue'
import { AdminDto } from '@/services/administration/dto/admin.dto'
import { CompanyAllList } from '@/services/organization/model/organization.model'
import { toast } from 'vue3-toastify'
import { get } from 'node_modules/axios/index.cjs'
import { getErrorMessage } from '@/utils/functions'

interface filterType {
  isActive: boolean | null
  isCashDeskActive: boolean | null
  searchText: string
}

definePage({
  meta: {
    permission: PERMISSIONS.ORGANIZATION
  }
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const totalNumber = ref<number | undefined>(0)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const tableKey = ref(0)

const companyId = ref(Number(route.query.orgId) || undefined)
const commandState = ref({
  add: false,
  show: true,
  edit: false,
  delete: false,
  details: true
})

const userList = ref<OtherUserPageData[]>([])
const organizationList = ref<CompanyAllList[]>([])
const isFetching = ref(false)
const filter = ref<filterType>({
  isActive: null,
  isCashDeskActive: null,
  searchText: ''
})
const isActiveType = ref([
  {
    text: t('active'),
    value: true
  },
  {
    text: t('notActive'),
    value: false
  }
])
const isCashDeskActiveType = ref([
  {
    text: t('active'),
    value: true
  },
  {
    text: t('notActive'),
    value: false
  }
])
const tableHeader = ref<TableHeaderTypes[]>([
  {
    text: t('sold_tickets.table.action'),
    role: 'action',
    key: 'action',
    id: ''
  },
  {
    text: t('login.login'),
    role: 'text',
    key: 'login',
    id: ''
  },
  {
    text: t('user.firstName'),
    role: 'text',
    key: 'firstName',
    id: ''
  },
  {
    text: t('user.lastName'),
    role: 'text',
    key: 'lastName',
    id: ''
  },
  {
    text: t('user.phone'),
    role: 'text',
    key: 'telefon',
    id: ''
  },
  {
    text: t('contract.organization'),
    role: 'text',
    key: 'organizationName',
    id: ''
  },
  {
    text: t('active'),
    role: 'checkbox',
    key: 'active',
    id: ''
  },
  {
    text: t('user.cashier'),
    role: 'checkbox',
    key: 'isKassir',
    id: ''
  },
  {
    text: t('user.palaceId'),
    role: 'text',
    key: 'palaceId',
    id: ''
  }
])

const menuList = ref<TableActionListType[]>([
  {
    id: 1,
    name: t('actions.view'),
    isVisible: () => {
      return commandState.value.details
    }
  },
  {
    id: 2,
    name: t('activate'),
    isVisible: (row: AdminDto) => {
      return !row.active
    }
  },
  {
    id: 3,
    name: t('deactivate'),
    isVisible: (row: AdminDto) => {
      return row.active
    }
  }
])

const fetchOrganizationList = async () => {
  try {
    const { data } = await getCompanyAllList()
    organizationList.value = data.result
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
}

const getOtherUserList = async () => {
  isFetching.value = true
  try {
    const { data } = await getAllOtherUserList({
      search: filter.value.searchText,
      isKassir: filter.value.isCashDeskActive,
      isAdmin: filter.value.isActive,
      skip: currentPage.value,
      take: itemsPerPage.value,
      companyId: companyId.value
    })
    userList.value = data.result.data
    totalNumber.value = data.result.total
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    isFetching.value = false
  }
}

const handleClickMenu = async (value: { id: number; nameId: number }) => {
  switch (value.nameId) {
    case 1:
      router.push(`/admin/users-organizations/view/${value.id}`)
      break
    case 2:
      await changeUserStatus(value.id, true)
      await getOtherUserList()
      break
    case 3:
      await changeUserStatus(value.id, false)
      await getOtherUserList()
      break
    default:
      console.log('default clicked')
      break
  }
}

watch(
  [filter],
  () => {
    tableKey.value++
    currentPage.value = 0
    getOtherUserList()
  },
  { deep: true }
)
watch(companyId, () => {
  getOtherUserList()
})

onMounted(async () => {
  await Promise.all([fetchOrganizationList(), getOtherUserList()])
})
</script>

<style lang="scss">
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
    margin-top: -10px;
    padding: 10px;
    z-index: 1;
  }
}

.btn-group {
  display: flex;
  gap: 10px;
  align-items: center;

  .v-btn {
    margin-bottom: 0 !important;
    margin-top: 6px;
  }
}
</style>
