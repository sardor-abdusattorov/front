export interface ReportByMonthDto {
  byMonth: boolean
  skip: number
  take: number
  year: number | null
  month: number | null
  startDate: string
  endDate: string
  orgId: string | null
  eventIdList:[]
  date?:[]
}
