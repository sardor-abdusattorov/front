export interface TicketModel {
  eventTicketId: number
  eventId: number
  eventSessionId: number
  palaceId: number
  palaceHallId: any
  systemOwnerName: string
  systemOwnerTin: string
  eventName: string
  eventOrgName: string
  palaceName: string
  palaceAddressName: string
  cashierFullName: string
  cashierTin: string
  palacePhone: string
  orderId: number
  ticketSerial: any
  ticketType: string
  isWithoutSeats: boolean
  ticketCount: number
  fullName: any
  sectorName: any
  row: any
  seat: any
  day: any
  month: any
  year: any
  time: any
  payDate: string
  ticketSum: number
  currency: string
  ticketItems: TicketItem[]
  receivedCash: number
  receivedCard: number
  totalReceived: number
  totalVAT: number
  totalVATPercent: any
  generateCode: string
  terminalId: string
  receipId: number
  fiscalSign: string
  note: string
}

export interface TicketItem {
  name: string
  ticketPrice: number
  price: number
  amount: number
  vatPercent: number
  vat: number
  packageCode: string
  packageName: string
  spic: string
  discount: number
  tin: string
}

export interface TicketSessionList {
  ticketId: number
  eventSessionId: number
  seatId: number
  tarifType: number
  tarifId: number
  tarifName: string
  price: number
  color: string
  isFondRejected: boolean
  isWithoutSeats: boolean
}

export interface BlockchainModel {
  id: number
  contractNumber: any
  contractDate: any
  createDate: string
  orgId: number
  tableId: number
  tableDocId: number
  contractAddress: string
  transactionHash: string
  parentBlockHash: any
  blockHash: any
  blockNumber: any
  orgName1: string
  agentName: string
  organizatorName: any
  eventName: string
  eventId: number
  ticketNumber: string
}
