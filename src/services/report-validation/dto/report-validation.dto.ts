export interface ReportValidationDto {
  id: number
  ticketNumber: string
  eventName: string
  sessionName: string
  statusName: string
  rejectReasonName: string
  sectorName?: string
  rowNumber?: number
  seatNumber?: number
  validationDate: string
}
