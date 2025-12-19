export interface ReportTicketOrderDto {
  id: number
  orderId: number
  ticketId: number
  fioTicket?: string
  telefon?: string | number
  isAgentRate: boolean
  ticketRealSum: number
  ticketPriviligesSum: number
  ticketSum: number
  ticketFondSum: number
  ticketAgentSum: number
  ticketOrganizatorSum: number
  ticketSerial: string
  region: string
  country: string
  firstName: string
  lastName: string
  middleName: string
  sectorName?: string
  rowNumber?: number
  seatNumber?: number
  payDate: string
  isReject: boolean
  rejectDate?: string
  cardPayId?: string
  eventName: string
  eventDate: string
  isExchanged: boolean
  palaceOrgInn: string
  palaceOrgName: string
  eventOrgName: string
  orderOrgName: string
  paymentTypeName: string
  tarifName: string
  privilegesName: string
  ticketUsed: string
}
