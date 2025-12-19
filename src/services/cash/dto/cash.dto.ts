export interface CashDto {
  eventBegin: string
  eventName: string
  eventTicketId: number
  fineSum: number
  fio: string
  orderId: number
  orderTicketId: number
  palaceName: string
  payDate: string
  phone: string
  pnfl: string
  qrCodeURL: string
  rejectDate: string
  rejectSum: number
  ticketSerial: string
  ticketSum: number
}
export interface RejectedTicketsListForm {
  id: number | null
  eventId: number | null
  fio: string | null
  ticketSerial: string | null
  skip?: number
  take?: number | null
  eventOrgId: number | null
}
export interface BookedTicketsListForm {
  id: number | undefined
  eventId: number | undefined
  fio: string | undefined
  ticketSerial: string | undefined
  skip?: number
  take?: number | undefined
}
export interface SoldOrganizationListForm {
  id: number | null
  eventId: number | null
  fio: string | null
  ticketSerial: string | null
  skip?: number
  take?: number | null
  orderId: number | null
  fromDate: Date | null | string
  toDate: Date | null | string
  eventOrgId: number | null
}
export interface CashSoldDto {
  isMultiple: boolean
  orderGuid: number | string
  orderId: number
  payDate: string
  paymentTypeId: number
  paymentTypeName: string
  ticketList: CashSoldTicketDto[]
}

export interface CashSoldTicketDto {
  eventBegin: string
  eventName: string
  eventTicketId: number
  eventTypeId: number
  fio: string
  isExchange: boolean
  isRejectTicket: boolean
  isWithoutSeats: boolean
  orderTicketId: number
  palaceName: string
  phone: string
  pnfl: string
  priviligesName: string
  priviligesRate: number
  rowNumber: string
  seatNumber: string
  sectorName: string
  tarifName: string
  ticketSerial: string
  ticketSum: number
}

export interface OrderBookingDto {
  paymentTypeId: number
  orderTicketIdList: number[]
}

export interface CashierDto {
  countryId: null | number
  eventId: null | number
  eventSessionId: null | number
  isMultiple: boolean
  paymentTypeId: null | number
  regionId: null | number
  ticketTariflist: {
    ticketCount: number
    ticketPrivilegesId: null | number
    ticketTarifId: number | null
  }[]
}
