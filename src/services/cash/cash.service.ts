import { $http, $api } from '@/utils/http'
import {
  BookedTicketsListForm,
  CashierDto,
  CashSoldDto,
  OrderBookingDto,
  RejectedTicketsListForm,
  SoldOrganizationListForm
} from '@/services/cash/dto'
import {
  CashEventModel,
  TarifsModel,
  CashModel,
  CashModelSold,
  SessionModel,
  PrivilagesModel,
  TheatreTicketModel,
  CashModelResultSold
} from '@/services/cash/model'

import { filterFalsyValues } from '@/utils/functions'
import { OrganizationList } from '@/services/cash/model/organization'
import { TicketSessionList } from '@/services/ticket/model/ticker.model'

export const getRejectedTicketsList = async (form: RejectedTicketsListForm) => {
  const params = filterFalsyValues<RejectedTicketsListForm>(form)
  return $http.post<CashModel>('/CashPayment/RejectTiketList', params)
}
export const getSoldOrganizationList = async () => {
  return $http.get('/CashPayment/SoldOrganizatorList')
}
export const getSoldEventList = async (id: number | null) => {
  return $http.get(`/CashPayment/SoldEventList?organizatorId=${id}`)
}

export const getSoldTicketList = async (form: SoldOrganizationListForm) => {
  const params = filterFalsyValues<RejectedTicketsListForm>(form)
  return $http.post<CashModelSold>('/CashPayment/SoldTiketList', params)
}

export const getCashierList = async (organizatorId: number) => {
  return $api.get<BaseResponse<CashEventModel[]>>('api-cash/Cashier/GetEventList?organizatorId=' + organizatorId)
}

export const getSessionTariffList = async (sessionId: number) => {
  return $api.get<BaseResponse<SessionModel[]>>(`/api-cash/Cashier/GetEventSessionList?eventId=${sessionId}`)
}
export const getTariffList = async (eventId: number) => {
  return $api.get<BaseResponse<TarifsModel[]>>(`/api-cash/Cashier/GetSessionTarifList?sessionId=${eventId}`)
}

export const getPrivilagesList = async (id: number) => {
  return $api.get<BaseResponse<PrivilagesModel[]>>(`/api-cash/CashOrder/GetPriviligesList?eventId=${id}`)
}

export const getTicketPrivRound = async (ticketSum: number, privRate: number, privRound=0) => {
  return $api.get<BaseResponse<any>>(`/api-cash/CashOrder/GetTicketPrivRound?ticketSum=${ticketSum}&privRate=${privRate}&privRound=${privRound}`)
}

export const getMuseumTicketSum = async (ticketCount: number, ticketPrivilegesId: number | null, ticketTarifId: number) => {
  return $api.post<BaseResponse<any>>(`/api-cash/CashPayment/GetMuseumTicketSum`, {
      ticketCount, ticketPrivilegesId, ticketTarifId
  })
}

export const postCashMuseium = async (dto: CashierDto) => {
  return $api.post<BaseResponse<{ orderId: number }>>('/api-cash/CashPayment/OrderMuseum', dto)
}

export const getPdfDailyReport = async (params?: {} | null) => {
  return $http.post('/Export/DailyReportPdf', { ...params }, { responseType: 'blob' })
}
export const getOrganizationList = async (params?: {} | null) => {
  return $api.get<BaseResponse<OrganizationList[]>>('api-cash/Cashier/GetOrganizatorList', { ...params })
}

export const getMuseumList = async (params?: {} | null) => {
  return $api.get('api-cash/Cashier/GetMuseumList', { ...params })
}

export const getSessionSvg = async (sessionId: number) => {
  return $api.get<BaseResponse<{ svgText: string }>>('api-cash/Cashier/GetSessionSvg', { params: { sessionId } })
}
export const orderBooking = async (orderId: number) => {
  return $http.post<BaseResponse<{ success: boolean }>>('CashPayment/OrderBooking', null, {
    params: { orderId }
  })
}
export const getSessionTicketList = async (sessionId: number) => {
  return $api.get<BaseResponse<TicketSessionList[]>>('api-cash/Cashier/GetSessionTicketList', { params: { sessionId } })
}

export const addTicketWithoutSeat = async (params: { ticketTarifId: number; ticketCount: number }) => {
  return $http.post<BaseResponse<TheatreTicketModel[]>>('CashOrder/AddTicketWithoutSeat', null, { params })
}
export const getOrderTicketList = async () => {
  return $http.get<BaseResponse<TheatreTicketModel[]>>('CashOrder/GetOrderTicketList')
}

export const addTicket = async (ticketId: string) => {
  return $http.post<BaseResponse<TheatreTicketModel>>('/CashOrder/AddTicket', null, { params: { ticketId } })
}

export const updateTickets = async (tickets: TheatreTicketModel[]) => {
  return $http.put<BaseResponse<{ success: boolean }>>('/CashOrder/UpdateTicket', tickets)
}

export const removeTicket = async (orderTicketId: number) => {
  return $http.delete<BaseResponse<{ success: boolean }>>('/CashOrder/DeleteTicket', { params: { orderTicketId } })
}
export const checkIsBooking = async () => {
  return $api.get<BaseResponse<{ path: 'TRUE' | 'FALSE' }>>('api-admin/Reference/IsBooking')
}

export const orderTicket = async (payload: { orderId: number; paymentTypeId: number }) => {
  return $http.post<BaseResponse<CashSoldDto>>('/CashPayment/OrderPayment', payload)
}

export const getBookingTicketList = async (dto: BookedTicketsListForm) => {
  return $http.post<BaseResponse<CashModelResultSold>>('/CashPayment/BookingTiketList', dto)
}

export const orderBookingPayment = async (dto: OrderBookingDto) => {
  return $http.post<BaseResponse<CashSoldDto>>('/CashPayment/OrderBookingPayment', dto)
}
export const getIsBooking = async () => {
  return $api.get('/api-admin/Reference/IsBooking')
}
