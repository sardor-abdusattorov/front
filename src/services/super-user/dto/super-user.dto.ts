export interface RejectTicketListDto {
  orgId: number
  eventId: number
  sessionId: number
  skip: number
  take: number
  orderSerial: string
}

export interface SoldTicketListDto {
  eventId: number
  orderSerial: string
  skip: number
  take: number
  orgId: number
  sessionId: number
}
