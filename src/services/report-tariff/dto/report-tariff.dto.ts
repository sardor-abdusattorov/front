// Type definitions
export interface ReportTariffDto {
  museum: string
  cashier: string
  palace: string
  from: string
  to: string
  eventGroups: EventGroup[]
  count: number
}

export interface EventGroup {
  id: number
  event: string
  tariffs: Tariff[]
  total: Total
}

export interface Tariff {
  id: number
  name: string
  price: number
  privilege?: any
  percent?: any
  paymentTypes: PaymentType[]
  agents: PaymentType[] // Assuming agents are also of type PaymentType
  total: Total
}

export interface Total {
  [key: string]: any
  id?: number
  name?: string
  quantity: number
  sum: number
  agentSum?: number
}

export interface PaymentType {
  [key: string]: any
  id: number
  name: string
  quantity: number
  sum: number
  agentSum?: number
}
export type TotalsType = { [key: string]: any; quantity: number; sum: number; agentSum?: number }

export type TotalType = { [key: string]: TotalsType } & {
  sum: number
  quantity: number
}
