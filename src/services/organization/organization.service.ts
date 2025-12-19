import { $api, $http } from '@/utils/http'
import { CompanyStructureListDto, CreateOrganizationDto, OtherUserPageGetAllDto } from './dto/organization.dto'
import {
  CompanyAllList,
  CompanyByIdResult,
  CompanyByStructureResult,
  CompanyPaymentType,
  GetOtherUserPageGetAllResult
} from './model/organization.model'

export const getCompanyStructureList = async () => {
  return $api.get<BaseResponse<CompanyStructureListDto[]>>('api-company/Company/StructureList')
}

export const getCompanyByStructureId = async (params: {
  searchText: string
  tin?: any
  structureId?: number
  skip?: number | string
  take?: number | string
  statusId?: number
}) => {
  return $api.get<BaseResponse<CompanyByStructureResult>>('api-company/Company/CompanyByStructureIdPageGetAll', {
    params
  })
}

export const getCompanyById = async (id: number) => {
  return $api.get<BaseResponse<CompanyByIdResult>>(`api-company/Company/CompanyGetById/${id}`)
}

export const getCompanyAllList = async () => {
  return $api.get<BaseResponse<CompanyAllList[]>>('api-admin/List/GetCompanyAllList')
}

export const getAllEventListByDate = async (params: { OrgId: string | null; startDate: string; endDate: string }) => {
  return $api.get('api-admin/List/GetAllEventsListByDate', { params })
}
export const getAllEventListBySaleDate = async (params: { OrgId: string; startDate: string; endDate: string }) => {
  return $api.get('api-admin/List/GetAllEventsListBySaleDate', { params })
}

export const getOtherUserPageGetAll = async (params: OtherUserPageGetAllDto) => {
  return $api.get<BaseResponse<GetOtherUserPageGetAllResult>>('api-admin/Management/OtherUserPageGetAll', {
    params
  })
}

export const createOrganization = async (data: CreateOrganizationDto) => {
  return $api.post<BaseResponse<any>>('api-company/Company/CompanyAdd', data)
}

export const updateOrganization = async (data: CreateOrganizationDto) => {
  return $api.put<BaseResponse<any>>('api-company/Company/CompanyUpdate', data)
}

export const updateOrganizationFiles = async (data: { companyId: number; fileName: string }) => {
  return $api.put<BaseResponse<any>>('api-company/company/CompanyFileUpdate', data)
}

export const checkVatTaxpayerStatus = async (params: { tin: string }) => {
  return $http.get<{ statusCode: number; result: { success: boolean }; error: any; id: any }>(
    'CashPayment/CheckTaxpayer/CheckVatTaxpayerStatus',
    {
      params
    }
  )
}

export const getStructureListWithoutFond = async () => {
  return $api.get<BaseResponse<{ value: number; text: string }[]>>('api-admin/List/GetStructureListWithoutFond')
}

export const getStructureList = async () => {
  return $api.get<BaseResponse<{ value: number; text: string }[]>>('api-admin/List/GetStructureListAbonent')
}

export const getStructureListForPalace = async () => {
  return $api.get<BaseResponse<{ value: Number; nameUz: string; nameRu: string; nameEn: string }[]>>(
    'api-admin/List/GetStructureListForPalace'
  )
}

export const getCompanyPaymentTypeList = async (params: { companyId: number }) => {
  return $api.get<BaseResponse<CompanyPaymentType[]>>(`api-company/PaymentType/All`, {
    params
  })
}

export const CompanyPaymentTypeUpdate = async (data: { companyId: number; paymentTypeIds: number[] }) => {
  return $api.put<BaseResponse<any>>(`api-company/PaymentType/Update`, data)
}

export const getCompanyListByStructureId = async (params: { structureId: number }) => {
  return $api.get<BaseResponse<CompanyAllList[]>>(`api-admin/List/GetCompanyList`, {
    params
  })
}

export const approveCompany = async (params: { orgid: number }) => {
  return $api.put(`api-company/Company/CompanyApprove`, null, {
    params
  })
}

export const rejectCompany = async (data: { id: number; reject_reason: string }) => {
  return $api.put(`api-company/Company/CompanyReject`, data)
}

export const agentMinusBalance = async (params: { agentId: number; minusBalance: number }) => {
  return $api.put(`api-company/Company/AgentMinusBalance`, null, {
    params
  })
}
