import { $api, $http } from '@/utils/http'
import { TicketParamsDto } from './dto/ticket.dto'
import { BlockchainModel, TicketModel, TicketSessionList } from './model/ticker.model'

export const getTicketsByOrder = async (dto: TicketParamsDto) => {
  return $http.get<BaseResponse<TicketModel[]>>('/CashPrint/GetTicketsByOrder', { params: dto })
}
export const getTicketsByList = async (dto: number[]) => {
  return $http.post<BaseResponse<TicketModel[]>>('/CashPrint/GetTicketsByList', dto)
}

export const getTicketById = async (id: number) => {
  return $http.get<BaseResponse<TicketModel>>(`/CashPrint/GetTicketsById?id=${id}`)
}
export const getExchangeTickets = async (orderTicketId: number) => {
  return $http.get<BaseResponse<TicketSessionList[]>>('/CashPayment/GetExchangeTickets', { params: { orderTicketId } })
}

export const exchangeTicket = async (payload: { newEventTicketId: number; orderTicketId: number }) => {
  return $http.post<BaseResponse<{ success: boolean }>>('/CashPayment/Exchange', payload)
}

export const getMultipleTicketsRejectInfo = async (orderId: number) => {
  return $http.get<BaseResponse<{ rejectSum: number; fineSum: number }>>(
    `CashPayment/MultipleTicketRejectInfo?orderId=${orderId}`
  )
}

export const multipleTicketsReject = async (orderId: number) => {
  return $http.post<BaseResponse<{ success: boolean }>>(`CashPayment/MultipleTicketReject?orderId=${orderId}`)
}
export const ticketsRejectInfo = async (orderId: number) => {
  return $http.get<BaseResponse<{ rejectSum: number; fineSum: number }>>(
    `CashPayment/TicketRejectInfo?ticketId=${orderId}`
  )
}

export const ticketsReject = async (orderId: number) => {
  return $http.post<BaseResponse<{ success: boolean }>>(`CashPayment/TicketReject?id=${orderId}`)
}

export const getTicketOrderPrinted = async (orderId: number) => {
  return $http.put<BaseResponse<{ success: boolean }>>(
    `/CashPrint/OrderUpdate/OrderTicketsSuccessfullyPrinted?orderId=${orderId}`
  )
}
export const getTicketListPrinted = async (ticketIds: number[]) => {
  return $http.put<BaseResponse<{ success: boolean }>>(`CashPrint/TicketUpdate/TicketSuccessfullyPrinted`, ticketIds)
}

export const getBlockchainTickets = async (params: {} | null) => {
  return $api.get<BaseResponse<{ data: BlockchainModel[]; total: number }>>('api-company/Blockchain/GetAllTickets', {
    params
  })
}
