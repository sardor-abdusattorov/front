import { $api, $blob } from '@/utils/http'
import { ReportTicketOrderModel } from '@/services/report-ticket/model/report-ticket-order.model'
import { PaymentTypeDto } from '../region/dto/region.dto'

export const getReportTicketOrder = async (params?: {} | null) => {
  return $api.post<ReportTicketOrderModel>('api-admin/Report/TicketOrder', params)
}
export const getReportTicketEvent = async () => {
  return $api.get('api-admin/Report/TicketEventListForDropdown')
}
export const getReportTicketSaleOrg = async () => {
  return $api.get('api-admin/Report/TicketSaleOrgListForDropdown')
}

export const getReportTicketRegion = async () => {
  return $api.get('api-admin/Reference/RefRegionPageGetAll')
}

export const getReportTicketCountry = async () => {
  return $api.get('api-admin/Reference/RefCountryGetAll')
}

export const getReportSellerOrg = async () => {
  return $api.get('api-admin/Report/TicketSellerOrgList')
}

export const getTicketEventOrgListForDropdown = async () => {
  return $api.get('api-admin/Report/TicketEventOrgListForDropdown')
}

export const getReportTicketPaymentType = async () => {
  return $api.get<BaseResponse<PaymentTypeDto[]>>('api-company/PaymentType/Get')
}

export const getReportTicketCashier = async () => {
  return $api.get('api-admin/Management/GetCashiers')
}

export const getExcelReportTicket = async (params?: {} | null) => {
  return $blob.post('api-admin/Report/TicketOrderExcel', params)
}

export const getReports = async (params: { date1: string, date2: string, skip: number, take: number }) => {
  return $api.get('api-admin/Report/Report1', { params })
}

export const getExcelReports = async (params: { date1: string, date2: string, skip: number, take: number }) => {
  return $blob.get('api-admin/Report/Report1Excel?', { params })
}
