import { $api } from '@/utils/http'
import { ReportValidationModel } from '@/services/report-validation/model/report-validation.model'
export const getReportValidationTable = async (params?: {} | null) => {
  return $api.get<ReportValidationModel>('api-admin/Report/ValidationTicket', {
    params
  })
}
export const getReportEventListCreator = async () => {
  return $api.get('api-admin/List/GetAllEventsListByCreator')
}
export const getReportTicketStatus = async () => {
  return $api.get('api-admin/List/GetTurniketTicketStatusList')
}
export const getReportRejectReason = async () => {
  return $api.get('api-admin/List/GetTurniketRejectReasonList')
}
