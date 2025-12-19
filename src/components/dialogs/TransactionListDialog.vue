<script lang="ts" setup>
import { DATE_TIME_FORMAT } from '@/constants/formats'
import { getTransactionList, TransactionDto } from '@/services/transaction/transaction.service'
import { formatMoney, getErrorMessage } from '@/utils/functions'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

const transactionList = ref<TransactionDto[]>([])
const isLoading = ref(false)
const { t } = useI18n()

const emit = defineEmits(['close'])

const getTransaction = async () => {
  isLoading.value = true
  try {
    const {
      data: { result }
    } = await getTransactionList()
    transactionList.value = result
  } catch (e) {
    toast.error(getErrorMessage(e))
  } finally {
    isLoading.value = false
  }
}

const closeHandler = () => {
  transactionList.value.length = 0
  emit('close')
}

onMounted(getTransaction)
</script>

<template>
  <v-card class="card__dialog">
    <v-btn class="close-btn" icon="mdi-close" size="small" @click="closeHandler" />
    <template v-slot:text>
      <v-table class="table">
        <thead>
          <tr>
            <th class="text-left text-uppercase">{{ t('registerTime') }}</th>
            <th class="text-left text-uppercase">{{ t('transactionType') }}</th>
            <th class="text-left text-uppercase">{{ t('plan') }}</th>
            <th class="text-left text-uppercase">{{ t('details') }}</th>
            <th class="text-left text-uppercase">{{ t('sum') }} (UZS)</th>
            <th class="text-left text-uppercase">{{ t('balance') }} (UZS)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in transactionList" :key="idx">
            <td>{{ dayjs(item?.real_time).format(DATE_TIME_FORMAT) }}</td>
            <td>{{ item?.transaction_type_name }}</td>
            <td>{{ item?.plan_name }}</td>
            <td>{{ item?.detail }}</td>
            <td>{{ formatMoney(item?.payment_summa) }}</td>
            <td>{{ formatMoney(item?.saldo) }}</td>
          </tr>
        </tbody>
      </v-table>
    </template>
    <v-progress-circular class="spinner" indeterminate color="#9c27b0" v-if="isLoading"></v-progress-circular>
  </v-card>
</template>

<style lang="scss" scoped>
table tr th {
  font-weight: 300;
  color: #909090;
  font-size: 11px;
  font-family: Circe-Bold, sans-serif;
  letter-spacing: -0.09px;
  line-height: 14px;
  border: 0;
  text-transform: uppercase;
}
table tr td {
  word-wrap: break-word;
  line-height: 18px;
}
.close-btn {
  position: fixed;
  width: 24px;
  height: 24px;
  right: 10px;
  top: 10px;
}
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.card__dialog {
  position: relative;
  min-height: 90dvh;
}
</style>
