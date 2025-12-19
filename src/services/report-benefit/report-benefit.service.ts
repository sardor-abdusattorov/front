import { $api, $blob } from '@/utils/http'
import { ReportBenefitDto } from '@/services/report-benefit/dto/report-benefit.dto'

export const getReportBenefit = async (params?: {} | null) => {
  return $api.post<ReportBenefitDto>('api-admin/Report/ReportByPrivilege', {
    ...params
  })
}
export const getBenefitPalaceList = async () => {
  return $api.get('api-admin/List/GetPalaceListByOrgToken')
}

export const getExcelBenefits = async (params?: {} | null) => {
  return $blob.post('api-admin/Report/ReportByPrivilegeExcel', {
    ...params
  })
}
