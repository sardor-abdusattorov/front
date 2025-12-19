export interface ReprotByMonthModelResult {
  data: ReportByMonthData
  total: number
}

export interface ReportByMonthData {
  item1: ReportsByMonthModel[][]
  item2: AgentListHeader[]
}

export interface ReportsByMonthModel {
  eventStartTime: string
  eventDate: string
  sessionId: number
  eventName: string
  palaceOrgName: string
  ticketPlanCount: number
  ticketPrice: number
  ticketPlanSum: number
  ticketBankCount: number
  ticketBankSum: number
  ticketCashCount: number
  ticketCashSum: number
  ticketCardCount: number
  ticketCardSum: number
  ticketFreeCount: number
  ticketFreeSum: number
  ticketPaymeCount: number
  ticketPaymeSum: number
  ticketClickCount: number
  ticketClickSum: number
  ticketUzumBankCount: number
  ticketUzumBankSum: number
  soldTicketsCount: number
  soldTicketsSum: number
  unsoldTicketsCount: number
  unsoldTicketsSum: number
  commission: number
  agentTickets: AgentTicket[]
}

export interface AgentTicket {
  agentId: number
  ticketCount: number
  ticketPrice: number
  ticketSum: number
  ticketAgentSum: number
  fondSum: number
}

export interface AgentListHeader {
  agentId: number
  agentName: string
}
