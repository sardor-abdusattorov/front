import { $api } from '@/utils/http'
import { ApplicationModel } from '@/services/events/model/application.model'

export const getApplicationEvents = async (params: any) => {
  return $api.get<ApplicationModel>('/api-event/EventAgents/GetRequestEvents', { params })
}

export const approveRequest = async (requestId: number) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/EventAgents/RequestApprove', null, {
    params: { requestId }
  })
}

export const rejectRequest = async (requestId: number, rejectReason: string) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-event/EventAgents/RequestReject', null, {
    params: { requestId, rejectReason }
  })
}
export const deleteRequest = async (requestId: number) => {
  return $api.delete<BaseResponse<{ success: boolean }>>(`api-event/EventAgents/RequestDelete/${requestId}`)
}
