export interface CashEventModel {
  eventId: number
  eventName: string
  eventOrgId: number
  eventTypeId: number
  isWithoutSeats: boolean
  palaceHallId: number
  palaceHallName: string
  palaceId: number
  palaceName: string
  privilegesRound: number
}

export interface SessionModel {
  name: string
  created: string
  eventId: number
  eventName: string
  id: number
  eventBegin: Date | string
  eventEnd: Date
  beginSale: Date
  endSale: Date
  active: boolean
  createUser: number
  tarifCount: number
}
