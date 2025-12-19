export interface ReportTicketReturnedDto {
  id: number
  orderId: number
  eventTicketId: number
  orderTicketId: number
  eventOrgName: string
  orderOrgName: string
  eventName: string
  ticketSerial: string
  eventBegin: string
  _eventDate: string
  payDate: string
  _payDate: string
  rejectDate: string
  _rejectDate: string
  ticketSum: number
  rejectSum: number
  fineSum: number
  fio?: string
  phone?: number | string
  pnfl?: string
  sectorName?: string
  rowNumber?: number
  seatNumber?: number
}
