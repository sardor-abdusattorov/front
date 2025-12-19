import { ReportBenefitDto } from '@/services/report-benefit/dto/report-benefit.dto'

export interface ReportBenefitModel {
  statusCode: number
  result: ReportBenefitDto
  error: null
  id: null
}
// export interface ReportBenefitModelResult {
//   data: ReportBenefitDto
// } not used
