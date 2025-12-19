import { $api } from '@/utils/http'
import { CreateUpdatedTarifDto, TarifDtoParam, TarifEventDtoParam, TarifsIndexDto } from './dto/tarif.dto'
import {
  EventListModel,
  EventSeatForSetTarif,
  EventSeatTariff,
  SessionByEventModel,
  TarifsEventResponse,
  TarifsResponse
} from './model/tarif.model'
import { SessionFormDto } from '../events/dto/events.dto'
import { SessionModel } from '../cash/model'

export const getEventSessionTarifs = async (params: TarifDtoParam) => {
  return $api.get<BaseResponse<TarifsResponse>>('api-event/EventSessionTarif/GetAllEventSessionTarif', {
    params
  })
}

export const getAllTicketsForSetTarif = async (eventSessionId: number) => {
  return $api.get<BaseResponse<EventSeatForSetTarif[]>>('api-event/EventTicket/GetAllTicketsForSetTarif', {
    params: { eventSessionId }
  })
}
export const eventTicketAdd = async (payload: EventSeatTariff[]) => {
  return $api.post<BaseResponse<{ success: boolean }>>('api-event/EventTicket/Add', payload)
}

export const eventTicketDelete = async (payload: EventSeatTariff[]) => {
  return $api.post<BaseResponse<{ success: boolean }>>('api-event/EventTicket/Delete', payload)
}

export const createEventSession = async (form: SessionFormDto) => {
  return $api.post<BaseResponse<{ success: boolean }>>('api-event/EventSession/Add', form)
}
export const updateEventSession = async (form: SessionFormDto) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/EventSession/Update', form)
}

export const getEventId = async (id: number) => {
  return $api.get<BaseResponse<SessionModel>>('api-event/EventSession/Get', { params: { id } })
}
export const toggleEventIsActive = async (params: { sessionId: number; isActive: boolean }) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/EventSession/Activate', null, { params })
}

export const getEventSessionVal = async (eventSessionId: number) => {
  return $api.get<BaseResponse<EventListModel>>('api-event/EventSession/EventSessionVal', {
    params: { eventSessionId }
  })
}
export const getAllEventId = async (params: TarifEventDtoParam) => {
  return $api.get<BaseResponse<TarifsEventResponse>>('api-event/EventSession/GetAllEventId', { params })
}

export const getSessionsByEvent = async (eventId: number) => {
  return $api.get<BaseResponse<SessionByEventModel>>(`api-event/EventSession/SessionByEvent/${eventId}`)
}

export const createTarif = async (form: CreateUpdatedTarifDto) => {
  return $api.post<BaseResponse<{ success: boolean }>>('api-event/EventSessionTarif/Add', form)
}

export const updatedTarif = async (form: CreateUpdatedTarifDto) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/EventSessionTarif/Update', form)
}
export const updatedTarifIndex = async (form: TarifsIndexDto[]) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/EventSessionTarifIndex/Update', form)
}

export const removeTarif = async (id: number) => {
  return $api.delete<BaseResponse<{ success: boolean }>>(`api-event/EventSessionTarif/Delete/${id}`)
}
