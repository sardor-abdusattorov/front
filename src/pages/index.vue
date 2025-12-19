<template>
  <base-spinner v-if="isLoading" />
  <template v-else>
    <MainHeaderStats />
    <v-row class="mt-3">
      <v-col cols="12" md="6" v-if="hasLength">
        <v-card>
          <v-card-item>
            <MainPaginationList @hasLength="hasLength = $event" />
          </v-card-item>
        </v-card>
      </v-col>
      <v-col cols="12" :md="hasLength ? 6 : 12">
        <v-card>
          <v-card-item>
            <MainChartStatistic />
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </template>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/user.store'
import { usePermissions } from '@/stores/permissions.store'
import { PERMISSIONS } from '@/constants/permissions'
import { sleep } from '@/utils/functions'

const store = useUserStore()
const { hasPermission } = usePermissions()
const router = useRouter()
const isLoading = ref(false)
const hasLength = ref(true)

onMounted(async () => {
  isLoading.value = true
  await sleep(300)
  if (store.isKassir && hasPermission(PERMISSIONS.CASH_SOLD_TICKETS)) {
    store.isMuseum ? router.push('/cash/museum-cashbox') : router.push('/cash/cashbox')
  }
  await sleep(300)
  isLoading.value = false
})

definePage({
  name: 'index'
})
</script>
