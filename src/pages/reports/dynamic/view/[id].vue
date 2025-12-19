<template>
  <div class="view-reports">
    <base-title :title="t('reports.view_report')" :back="true"></base-title>
    <v-card class="py-4">
      <div class="table-wrapper" v-html="table?.html" />
    </v-card>
  </div>
  <base-spinner v-if="loading" />
</template>

<script lang="ts" setup>
import { PERMISSIONS } from '@/constants/permissions'
import { getReportTemplatById } from '@/services/dynamic-reports/dynamic-reports.service'
import { getErrorMessage } from '@/utils/functions'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const table = ref<any>(null)
const route: any = useRoute()
const loading = ref(false)

const { t } = useI18n()
const getTableById = async () => {
  try {
    loading.value = true
    const { data } = await getReportTemplatById(route.params.id)
    table.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

definePage({
  meta: {
    permission: PERMISSIONS.REPORTS_FOND
  }
})

getTableById()
</script>

<style lang="scss">
.view-reports {
  .table-wrapper {
    width: 100%;
    min-height: 100%;
    padding: 0 20px;
    overflow: auto;

    table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;

      tr {
        th {
          border: 1px solid #ddd;
          padding: 10px 16px;
          text-transform: uppercase;
          font-size: 14px;
          text-align: center;
        }
      }
    }
  }
}
</style>
