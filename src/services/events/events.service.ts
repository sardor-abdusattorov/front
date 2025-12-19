import { $api } from '@/utils/http'
import {
  CreateEventResponse,
  EventsModel,
  GetEventListByOrgId,
  GetReferencesDataModel,
  RejectTicketModel
} from '@/services/events/model/events.model'

import {
  AddEventPrivilegesDto,
  AddEventRejectRatesDto,
  CreateEventModel,
  AgentList,
  PutEventPrivilegesRoundWithDiscountDto,
  AddEventRejectRatesListDto,
  ConfirmEventByFondDto
} from '@/services/events/dto/events.dto'
import { CompanyStructureListDto } from '../organization/dto/organization.dto'

export const getEventsAll = async (params?: {} | null) => {
  return $api.get<EventsModel>('api-event/Events/EventsGetAll', { params })
}

export const setEventStatusInProgress = (id: number) => {
  return $api.put<BaseResponse<{ success: boolean }>>(`api-event/Events/SetEventsStatusInProgress/${id}`)
}
export const getReferencesData = async (id: any) => {
  return $api.get<GetReferencesDataModel>(`api-admin/Reference/GetAllSpic?structureId=${id}`)
}
export const getAgeLimitList = async () => {
  return $api.get('api-admin/List/GetAgeLimitList')
}
export const getPalaceList = async (id: any) => {
  return $api.get(`api-admin/List/GetPalaceListByStructure?structureId=${id}`)
}
export const getEventById = async (id: any) => {
  return $api.get<BaseResponse<CreateEventModel>>(`api-event/Events/EventsGetById/${id}`)
}
export const createAddImage = async (formData: any) => {
  return $api.post('api-file/Files/Add', formData, { headers: { 'Content-Type': 'image/*' } })
}
export const createEventsAdd = async (form: CreateEventModel) => {
  return $api.post<BaseResponse<CreateEventResponse>>('api-event/Events/EventsAdd', form)
}

export const updateEventsEdit = async (form: CreateEventModel) => {
  return $api.put('api-event/Events/EventsUpdate', form)
}

// Fines apis
export const createTicketReject = async (form: AddEventRejectRatesDto) => {
  return $api.post<BaseResponse<{ success: boolean }>>('api-event/TicketRejectRate/AddEventRejectRates', form)
}

export const createSingleTicketReject = async (form: AddEventRejectRatesListDto) => {
  return $api.post<BaseResponse<{ success: boolean }>>('api-event/TicketRejectRate/AddEventRejectRate', form)
}

export const getTicketRejectById = async (id: number) => {
  return $api.get<BaseResponse<RejectTicketModel[]>>(`api-event/TicketRejectRate/GetAllEventRejects/${id}`)
}

export const updateEventRejectRateRate = async (form: AddEventRejectRatesListDto) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/TicketRejectRate/UpdateEventRejectRate', form)
}

export const deleteEventRejectRateRate = async (id: number) => {
  return $api.delete<BaseResponse<{ success: boolean }>>(`api-event/TicketRejectRate/DeleteEventRejectRate/${id}`)
}

// benefits apis
export const addEventPrivileges = async (form: AddEventPrivilegesDto[]) => {
  return $api.post<BaseResponse<{ success: boolean }>>('api-event/EventPrivileges/AddEventPrivileges', form)
}

export const updateEventPrivileges = async (form: AddEventPrivilegesDto[]) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/EventPrivileges/UpdateEventPrivileges', form)
}

export const deleteEventPrivileges = async (id: number) => {
  return $api.delete<BaseResponse<{ success: boolean }>>(`api-event/EventPrivileges/DeleteEventPrivileges/${id}`)
}

export const getAllEventById = async (eventId: number) => {
  return $api.get<BaseResponse<{ data: AddEventPrivilegesDto[]; total: number }>>(
    'api-event/EventPrivileges/GetAllEventById',
    {
      params: { skip: 0, take: 1000, eventId }
    }
  )
}

export const getAllEventByOrganizationId = async (organizationId: number) => {
  return $api.get<BaseResponse<GetEventListByOrgId[]>>('api-admin/List/GetAllEventsListByOrgId', {
    params: { OrgId: organizationId }
  })
}

export const getAllEventRoundWithDiscount = async (eventId: number) => {
  return $api.get<BaseResponse<{ isUseDiscountToPrivileges: boolean; privilegesRound: number }>>(
    'api-event/EventPrivileges/GetEventPrivilegesRoundWithDiscount',
    {
      params: { eventId }
    }
  )
}

export const updateEventRoundPrivileges = async (params: PutEventPrivilegesRoundWithDiscountDto) => {
  return $api.put<BaseResponse<{ success: boolean }>>(
    'api-event/EventPrivileges/PutEventPrivilegesRoundWithDiscount',
    null,
    { params }
  )
}

export const getListAgentByEvent = async (eventId: number) => {
  return $api.get<BaseResponse<AgentList[]>>('api-event/EventAgents/ListAgentByEvent', { params: { eventId } })
}

export const getEventAgentsForRequest = async (eventId: number) => {
  return $api.get<BaseResponse<AgentList[]>>('api-event/EventAgents/ListAgentForRequest', { params: { eventId } })
}
export const sendRequestToAgents = async (dto: { agentList: number[]; eventId: number }) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/EventAgents/SendRequestToAgents', dto)
}

export const getStatusIsBooking = async () => {
  return $api.get<BaseResponse<{ isBooking: boolean }>>('api-admin/Reference/GetStatusIsBooking')
}
export const getEventStatusList = async () => {
  return $api.get<BaseResponse<CompanyStructureListDto[]>>('api-admin/List/GetEventStatusList')
}

export const confirmEventByFond = async (params: ConfirmEventByFondDto) => {
  return $api.put('api-event/Events/ConfirmEventByFond', null, {
    params
  })
}

export const cancelEventByFond = async (eventId: number) => {
  return $api.put('api-event/Events/SetEventsStatusCancelledByFond', null, {
    params: { eventId }
  })
}

export const rejectEventByFond = async (params: { eventId: number; rejectReason: string }) => {
  return $api.put('api-event/Events/SetEventsStatusRejectByFond', null, {
    params
  })
}
