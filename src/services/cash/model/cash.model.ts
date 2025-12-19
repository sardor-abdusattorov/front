import { CashDto, CashSoldDto } from '@/services/cash/dto/cash.dto'

export interface CashModel {
  result: CashModelResult
}

export interface CashModelResult {
  data: CashDto[]
  total?: number
}
export interface CashModelSold {
  result: CashModelResultSold
}

export interface CashModelResultSold {
  data: CashSoldDto[]
  total: number
}

export interface CashierFilter {
  organizatorId: number | null
  eventId: number | null
  sessionId: number | null
}

export interface TheatreTicketModel {
  eventTicketId: number
  orderTicketId: number
  ticketSerial: string
  isVerification: boolean
  verificationStatusName: string
  eventName: string
  ticketSum: number
  ticketSumInitial: number
  realTicketSum: number
  isPrivileges: boolean
  privilegesRound: number
  sectorName: string
  seatNumber: number
  rowNumber: number
  bookingTime: number
  fullName?: string
  phone?: string
  passportPnfl?: string
  passportSerial?: string
  passportNumber?: string
  orderId?: number
  eventPrivilegesList: any[]
  eventPrivilegesId: number | null
  color: string
}
