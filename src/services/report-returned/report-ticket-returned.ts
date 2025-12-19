import { $api, $blob } from '@/utils/http'
import { ReportTicketReturnedModel } from '@/services/report-returned/model/report-ticket-returned.model'
export const getReportTicketReturned = async (params?: {} | null) => {
  return $api.post<ReportTicketReturnedModel>('api-admin/Report/RejectedTicket', params)
}
export const getReportTicketReturnedEvent = async () => {
  return $api.get('api-admin/Report/TicketEventListForDropdown')
}
export const getReportTicketReturnedSaleOrg = async () => {
  return $api.get('api-admin/Report/TicketSaleOrgListForDropdown')
}
export const getExcelReportReturnedTicket = async (params?: {} | null) => {
  return $blob.post('api-admin/Report/RejectedTicketExcel', params)
}
