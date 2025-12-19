import {
  ClearingGetByIdResult,
  InvoicePageGetAllData,
  InvoicePageGetAllResult
} from '@/services/payment/model/payment.model'
import {
  ClearingCreateInvoiceDto,
  ClearingUpdateInvoiceDto,
  InvoicePageGetAllDto
} from '@/services/payment/dto/payment.dto'
import { $api } from '@/utils/http'

export const InvoicePageGetAll = async (dto: InvoicePageGetAllDto) => {
  return $api.get<BaseResponse<InvoicePageGetAllResult>>('api-admin/Clearing/InvoicePageGetAll', {
    params: dto
  })
}

export const GetTourAgentInvoice = async (dto: any) => {
  return $api.get<BaseResponse<InvoicePageGetAllResult>>('api-admin/Clearing/GetTourAgentInvoices', {
    params: dto
  })
}

export const AddInvoice = async (data: ClearingCreateInvoiceDto) => {
  return $api.post<BaseResponse<InvoicePageGetAllData>>('api-admin/Clearing/AddInvoice', data)
}

export const CreateTourAgentInvoice = async (data: any) => {
  return $api.post<BaseResponse<InvoicePageGetAllData>>('api-admin/Clearing/CreateTourAgentInvoice', data)
}

export const InvoiceUpdateInvoice = async (data: ClearingUpdateInvoiceDto) => {
  return $api.put<BaseResponse<InvoicePageGetAllData>>('api-admin/Clearing/UpdateInvoice', data)
}

export const UpdateTourAgentInvoice = async (data: any) => {
  return $api.put<BaseResponse<InvoicePageGetAllData>>('api-admin/Clearing/UpdateTourAgentInvoice', data)
}

export const DeleteInvoice = async (id: number) => {
  return $api.delete(`api-admin/Clearing/InvoiceDelete/${id}`)
}

export const GetPaymentClearingById = async (id: number) => {
  return $api.get<BaseResponse<ClearingGetByIdResult>>(`api-admin/Clearing/GetById/${id}`)
}

export const GetTourAgentInvoiceById = async (id: number) => {
  return $api.get<BaseResponse<any>>(`api-admin/Clearing/GetTourAgentInvoiceById`, {
    params: { id }
  })
}

export const ApproveInvoice = async (id: number) => {
  return $api.put(`api-admin/Clearing/ApproveInvoice?invoiceId=${id}`)
}

export const SendTourAgentInvoice = async (id: number) => {
  return $api.patch(`api-admin/Clearing/SendTourAgentInvoice`, null, {
    params: { id }
  })
}

export const ApproveTourAgentInvoice = async (id: number) => {
  return $api.patch(`api-admin/Clearing/ApproveTourAgentInvoice`, null, {
    params: { id }
  })
}

export const RejectTourAgentInvoice = async (data: { id: number; rejectReason: string }) => {
  return $api.patch(`api-admin/Clearing/RejectGetTourAgentInvoice`, data)
}

export const DeleteGetTourAgentInvoice = async (id: number) => {
  return $api.delete(`api-admin/Clearing/DeleteGetTourAgentInvoice`, {
    params: { id }
  })
}

export const GetEventListForTourAgent = async (params: any) => {
  return $api.get(`api-cash/Cashier/GetEventListForTourAgent`, {
    params
  })
}
export const getClearingBalance = async () => {
  return $api.get<BaseResponse<{ id: number; balance: number }>>('api-admin/Clearing/GetBalance')
}
