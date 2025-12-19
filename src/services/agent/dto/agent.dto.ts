export interface GetAgentEventsDto {
  skip: number
  take: number
  searchText: string
}

export interface GetAllAgentEventsDto {
  skip: number
  take: number
  eventName?: string
  orgId?: any
  abonentTypeId?: any
}

export interface SendRequestFromAgentDto {
  eventId: number
}
