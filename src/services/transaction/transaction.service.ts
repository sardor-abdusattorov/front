import { $api } from '@/utils/http'

export interface TransactionDto{
  real_time: string
  transaction_type_name: string
  plan_name: string
  detail: string
  payment_summa: number
  saldo: number
}
export const getTransactionList = async () => {
  return $api.get<BaseResponse<TransactionDto[]>>('api-admin/Report/GetTransaction?skip=0&take=10000')
}

export const getTransactionBalance = async () => {
  return $api.get<BaseResponse<TransactionDto[]>>('api-company/Company/GetCompanySaldo')
}
