import { ReportTicketReturnedDto } from '@/services/report-returned/dto/report-ticket-returned.dto'

export interface ReportTicketReturnedModel {
  result: ReportTicketReturnedModelResult
}
export interface ReportTicketReturnedModelResult {
  data: ReportTicketReturnedDto[]
  total?: number
}
