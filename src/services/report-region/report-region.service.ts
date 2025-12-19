import { $api, $blob } from '@/utils/http'
import { ReportRegionModel } from '@/services/report-region/model/report-region.model'

export const getReportRegion = async (params?: {} | null) => {
  return $api.post<ReportRegionModel>('api-admin/Report/ReportByRegion', {
    ...params
  })
}
export const getReportCountry = async (params?: {} | null) => {
  return $api.post<ReportRegionModel>('api-admin/Report/ReportByCountry', {
    ...params
  })
}
export const getExcelCountry = async (params?: {} | null) => {
  return $blob.post('api-admin/Report/ReportByCountryExcel', {
    ...params
  })
}

export const getExcelRegion = async (params?: {} | null) => {
  return $blob.post('api-admin/Report/ReportByRegionExcel', {
    ...params
  })
}

export const getRegionPalaceList = async () => {
  return $api.get('api-admin/List/GetPalaceListByOrgToken')
}
export const getRegionPalaceListByOrgId = async (orgId: number) => {
  return $api.get(`api-admin/Palace/GetPalaceByOrgId?orgId=${orgId}`)
}
export const getRegionList = async () => {
  return $api.get('api-admin/Reference/RefRegionGetAll')
}
export const getDistrictList = async (id: number) => {
  return $api.get(`api-admin/Reference/RefDistrictGetAll?regionId=${id}`)
}
export const getCountryList = async () => {
  return $api.get('api-admin/Reference/RefCountryGetAll')
}

export const getRegionListNotAuth = async () => {
  return $api.get('api-admin/List/GetRegionList')
}

export const getDistrictListNotAuth = async (id: number) => {
  return $api.get(`api-admin/List/GetDistrictList?regionId=${id}`)
}
