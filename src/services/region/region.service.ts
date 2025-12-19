import { $api } from '@/utils/http'
import { PaymentTypeModel, RegionModel } from '@/services/region/model/region.model'

export const getCountryList = async (params?: {} | null) => {
  return $api.get<RegionModel>('api-admin/List/GetCountryList', {
    params
  })
}
export const getRegionList = async (params?: {} | null) => {
  return $api.get<RegionModel>('api-admin/List/GetRegionList', {
    params
  })
}
export const getPaymentTypeList = async () => {
  return $api.get<PaymentTypeModel>('api-company/PaymentType/Get')
}
