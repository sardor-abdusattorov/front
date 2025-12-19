<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'
import { capitalize, getErrorMessage } from '@/utils/functions'
import { PERMISSIONS } from '@/constants/permissions'
import { getAllSetups, updateSetup } from '@/services/directory/directory.service'

definePage({
  meta: {
    permission: PERMISSIONS.DICTIONARIES
  }
})

const { t, locale } = useI18n()
const loading = ref(false)
const dataList = ref<any[]>([])
const submitLoading = ref(false)
const currentPage = ref<number>(0)
const itemsPerPage = ref<number>(10)
const totalNumber = ref<number | undefined>(0)

const fetchData = async () => {
  loading.value = true
  try {
    const {
      data: {
        result: { total, data }
      }
    } = await getAllSetups({
      skip: currentPage.value,
      take: itemsPerPage.value
    })
    dataList.value = data
    dataList.value.map((item) => {
      if (item.fieldType == 'BOOLEAN') {
        item.fieldValue = item.fieldValue === 'TRUE'
      }
    })
    totalNumber.value = total
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
  loading.value = false
}

const saveSetup = async (item: any) => {
  if (item.fieldType == 'BOOLEAN') {
    item.fieldValue = item.fieldValue.toString().toLocaleUpperCase()
  }
  try {
    submitLoading.value = true
    await updateSetup(item)
    toast.success(t('messages.updated_success'))
    await fetchData()
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})
</script>

<template>
  <base-page-layout :title="t('directory.systemSetup')" :isLoading="loading">
    <template #filter>
      <div v-for="i in dataList" :key="i" class="py-3">
        <v-card class="py-2">
          <v-card-item>
            <v-row dense>
              <v-col cols="12" md="7">
                <p style="font-size: 14px; font-weight: bold; margin-bottom: 10px">
                  {{ t('contract.comment') }}
                </p>
                {{ i['comment' + capitalize(locale)] }}
              </v-col>
              <v-col cols="12" md="3">
                <p style="font-size: 14px; font-weight: bold; margin-bottom: 8px">
                  {{ t('directory.fieldValue') }}
                </p>
                <v-checkbox-btn v-if="i.fieldType == 'BOOLEAN'" v-model="i.fieldValue" />
                <BaseInput v-else type="number" v-model="i.fieldValue" class="w-50" />
              </v-col>
              <v-col cols="12" md="2">
                <p style="font-size: 14px; font-weight: bold; margin-bottom: 10px">
                  {{ t('contract.action') }}
                </p>
                <BaseButton :loading="submitLoading" @click="saveSetup(i)">
                  {{ t('actions.save') }}
                </BaseButton>
              </v-col>
            </v-row>
          </v-card-item>
        </v-card>
      </div>
    </template>
  </base-page-layout>
</template>
