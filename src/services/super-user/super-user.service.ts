import { RejectTicketListDto, SoldTicketListDto } from '@/services/super-user/dto/super-user.dto'
import { $api } from '@/utils/http'
import { RejectTicketListResult, SoldTicketListResult } from '@/services/super-user/model/super-user.model'
import { PaymentType } from '@/services/payment/dto/payment.dto'

export const getRejectTicketListForSU = async (params?: RejectTicketListDto | null) => {
  return $api.get<BaseResponse<RejectTicketListResult>>('api-superuser/SoldTickets/RejectTiketList', {
    params
  })
}

export const getSoldTicketListForSU = async (params?: SoldTicketListDto) => {
  return $api.post<BaseResponse<SoldTicketListResult>>('api-superuser/SoldTickets/SoldTiketList', params)
}

export const cancelTicketBySU = async (id: number) => {
  return $api.get<BaseResponse<{ success: boolean }>>(`api-superuser/SoldTickets/CancelTicket`, {
    params: { id }
  })
}

export const updateOrderPaymentTypeBySU = async (data: { orderId: number; paymentTypeId: PaymentType }) => {
  return $api.put<BaseResponse<{ success: boolean }>>(`api-superuser/SoldTickets/UpdateOrderPaymentType`, data)
}

export const cancelOrderBySU = async (OrderId: number) => {
  return $api.get<BaseResponse<{ success: boolean }>>('api-superuser/SoldTickets/CancelOrder', {
    params: { OrderId }
  })
}

export const cancelAllSessionOrdersBySessionID = async (sessionId: number) => {
  return $api.get<BaseResponse<{ success: boolean }>>('api-superuser/SoldTickets/CancelAllSessionOrders', {
    params: { SessionId: sessionId }
  })
}
