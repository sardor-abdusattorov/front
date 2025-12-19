import { $api, $blob } from '@/utils/http'
import { ReportByMonthDto } from './dto'
import { ReprotByMonthModelResult } from './model'

export const getReportByMonth = async (dto: ReportByMonthDto) => {
  return $api.post<BaseResponse<ReprotByMonthModelResult>>('api-admin/Report/MonthlyTicketReport', dto)
}
export const getReportByMonthExel = async (dto: ReportByMonthDto) => {
  return $blob.post('api-admin/Report/MonthlyTicketReportExcel', dto)
}
export const getReportByEventExel = async (dto: ReportByMonthDto | any) => {
  return $blob.post('api-admin/Report/MonthlyTicketReportByEventExcel', dto)
}
export const getReportBySalesExel = async (dto: ReportByMonthDto | any) => {
  return $blob.post('api-admin/Report/MonthlyTicketSalesReportExcel', dto)
}

export const getReportByEvent = async (dto: ReportByMonthDto | any) => {
  return $api.post<BaseResponse<ReprotByMonthModelResult>>('api-admin/Report/TicketReportByEvent', dto)
}

export const getReportBySales = async (dto: ReportByMonthDto | any) => {
  return $api.post<BaseResponse<ReprotByMonthModelResult>>('api-admin/Report/TicketSalesReport', dto)
}
