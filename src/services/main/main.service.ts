import { $api } from '@/utils/http'
import { MainModel, MainProfitModel, OrderEvents } from '@/services/main/model/main.model'

export const getDashboardCounts = async () => {
  return $api.get<MainModel>('api-admin/Report/GetDashboardCounts')
}

export const getPieChartProfit = async () => {
  return $api.get<MainProfitModel>('api-admin/Report/GetProfitByMonth')
}

export const getOrderEvents = async (params: { take: number; skip: number }) => {
  return $api.get<any>('api-admin/Report/GetOrderEvents', { params })
}
