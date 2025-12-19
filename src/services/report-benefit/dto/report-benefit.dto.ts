export interface ReportBenefitDto {
  museum: string
  cashier: string
  palace: string
  from: string
  to: string
  eventGroups: EventGroup[]
  count: number
}

interface EventGroup {
  id: number
  event: string
  tariffs: Tariff[]
}

interface Tariff {
  id: number
  name: string
  price: number
  privilege: string
  percent: number
  paymentTypes?: any
  agents?: any
  total: Total
}

interface Total {
  id?: number
  name: string
  quantity: number
  sum: number
  agentSum?: number
}
