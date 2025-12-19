export interface RejectTicketList {
  orderId: number
  eventTicketId: number
  orderTicketId: number
  palaceName: string
  eventName: string
  eventBegin: string
  ticketSerial: string
  ticketSum: number
  rejectSum: number
  fineSum: number
  rejectDate: string
  payDate: string
  fio: any
  pnfl: any
  phone: any
  qrCodeURL: any
}

export interface RejectTicketListResult {
  data: RejectTicketList[]
  total: number
}

export interface SoldTicketList {
  orderId: number
  orderGuid: any
  payDate: string
  paymentTypeId: number
  paymentTypeName: any
  isMultiple: any
  ticketList: {
    eventTicketId: number
    orderTicketId: number
    palaceName: string
    eventName: string
    isRejectTicket: boolean
    isExchange: boolean
    eventBegin: string
    ticketSerial: string
    ticketSum: number
    fio: any
    pnfl: any
    phone: string
    eventTypeId: number
    isWithoutSeats: boolean
    priviligesName: any
    priviligesRate: any
    sectorName: string
    seatNumber: number
    rowNumber: number
    tarifName: any
  }[]
}

export interface SoldTicketListResult {
  data: SoldTicketList[]
  total: number
  price: number
}
