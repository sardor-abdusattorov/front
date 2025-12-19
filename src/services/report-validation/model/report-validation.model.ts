import { ReportValidationDto } from '@/services/report-validation/dto/report-validation.dto'

export interface ReportValidationModel {
  result: ReportValidationModelResult
}
export interface ReportValidationModelResult {
  data: ReportValidationDto[]
  total?: number
}
