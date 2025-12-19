import { ReportTicketOrderDto } from '@/services/report-ticket/dto/report-ticket-order.dto'

export interface ReportTicketOrderModel {
  result: ReportTicketOrderModelResult
}
export interface ReportTicketOrderModelResult {
  data: ReportTicketOrderDto[]
  total?: number
}
