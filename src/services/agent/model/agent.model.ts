export interface GetAgentEventsList {
  orgId: number
  orgName: string
  palaceName: string
  palaceHallName: any
  eventId: number
  eventName: string
  ticketPrice: any
  contractId: any
  beginDate: string
  endDate: string
  abonentTypeId: number
  abonentTypeName: string
  statusId: any
  statusName: any
  rejectReason: any
  requestId: any
  requestStatusId: any
  requestStatusName: any
}

export interface GetAgentEventsResult {
  data: GetAgentEventsList[]
  total: number
}
