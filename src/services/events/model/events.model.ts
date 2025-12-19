import { EventsDto, GetReferencesDto } from '@/services/events/dto/events.dto'

export interface EventsModel {
  result: EventsModelResult
}

export interface EventsModelResult {
  data: EventsDto[]
  total?: number
}

export interface GetReferencesDataModel {
  result: GetReferencesDto[]
}

export interface CreateEventResponse {
  success: boolean
  eventId: number
  eventTypeId: number
  eventSessionId: number
}

export interface RejectTicketModel {
  id: number
  eventId: number
  eventName: string
  hour: number
  percent: number
}

export interface GetEventListByOrgId {
  text: string
  value: number
}
