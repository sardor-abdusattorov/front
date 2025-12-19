import { $api, $blob } from '@/utils/http'
import { ReportTariffModel } from '@/services/report-tariff/model/report-tariff.model'

export const getReportTariff = async (params?: {} | null) => {
  return $api.post<ReportTariffModel>('api-admin/Report/ReportByTariff', params)
}

export const getExcelTariff = async (params?: {} | null) => {
  return $blob.post('api-admin/Report/ReportByTariffExcel', {
    ...params
  })
}
