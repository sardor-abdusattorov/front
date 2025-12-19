import { GetAgentEventsResult } from '@/services/agent/model/agent.model'
import { $api } from '@/utils/http'
import { GetAgentEventsDto, GetAllAgentEventsDto, SendRequestFromAgentDto } from '@/services/agent/dto/agent.dto'

export const getAgentEvents = (params: GetAgentEventsDto) => {
  return $api.get<BaseResponse<GetAgentEventsResult>>('api-event/EventAgents/GetAgentEvents', { params })
}

export const getAllAgentEvents = (params: GetAllAgentEventsDto) => {
  return $api.get<BaseResponse<GetAgentEventsResult>>('api-event/EventAgents/GetAllAgentEvents', { params })
}

export const sendRequestFromEvent = (params: SendRequestFromAgentDto) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/EventAgents/SendRequestFromAgent', null, { params })
}

export const checkCanRegistration = () => {
  return $api.get<BaseResponse<{ path: string }>>('api-admin/Reference/CanReg')
}
