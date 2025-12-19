import { ReportTariffDto } from '@/services/report-tariff/dto/report-tariff.dto'

export interface ReportTariffModel {
  statusCode: number
  result: ReportTariffDto
  error: null
  id: null
}
// export interface ReportTariffModelResult {
//   data: ReportTariffDto
// } not have to create this interface
