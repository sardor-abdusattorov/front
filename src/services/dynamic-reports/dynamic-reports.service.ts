import { $api } from '@/utils/http'
import { CreateReportResult, DynamicColumnModel, DynamicModel, DynamicTableModel } from './model/dynamic-reports.model'

export const getReportTemplates = async (params: any) => {
  return $api.get<BaseResponse<{ data: DynamicTableModel[]; count: number }>>('api-admin/Report/GetReportTemplates', {
    params
  })
}
export const getReportTemplatById = async (id: number) => {
  return $api.get<BaseResponse<any>>('api-admin/Report/GetReportTemplateById?id=' + id)
}
export const getTables = async () => {
  return $api.get<BaseResponse<DynamicTableModel[]>>('api-admin/Report/GetTables')
}
export const getColumnById = async (id: number) => {
  return $api.get<BaseResponse<DynamicTableModel[]>>('api-admin/Report/GetColumnById', { params: { id } })
}
export const getColumnByTableId = async (tableId: number) => {
  return $api.get<BaseResponse<DynamicColumnModel[]>>('api-admin/Report/GetColumnByTableId', {
    params: { tableId }
  })
}

export const updateColumn = async (data: any) => {
  return $api.put(`api-admin/Report/UpdateColumn`, data)
}
export const updateTable = async (data: any) => {
  return $api.put(`api-admin/Report/UpdateTable`, data)
}

export const createReportTemplate = async (data: any) => {
  return $api.post<BaseResponse<{ success: boolean }>>(`api-admin/Report/CreateReportTemplate`, data)
}
export const updateReportTemplate = async (data: any) => {
  return $api.put<BaseResponse<{ success: boolean }>>(`api-admin/Report/UpdateReportTemplate`, data)
}

export const getColumnsByIds = async (ids: number[]) => {
  return $api.post<BaseResponse<DynamicColumnModel[]>>(`api-admin/Report/GetColumnListByIds`, ids)
}

export const activateReportTemplate = async (id: number) => {
  return $api.patch<BaseResponse<{ success: boolean }>>(`api-admin/Report/ActivateReportTemplate`, null, {
    params: { id }
  })
}

export const deactivateReportTemplate = async (id: number) => {
  return $api.patch<BaseResponse<{ success: boolean }>>(`api-admin/Report/DeactivateReportTemplate`, null, {
    params: { id }
  })
}

export const deleteReportTemplate = async (id: number) => {
  return $api.delete<BaseResponse<{ success: boolean }>>(`api-admin/Report/DeleteReportTemplate`, {
    params: { id }
  })
}
export const getReferenceBookByTableId = async (tableId: number) => {
  return $api.get<BaseResponse<any>>(`api-admin/Report/GetReferenceBookByTableId`, {
    params: { tableId }
  })
}

export const getUserReports = async () => {
  return $api.get<BaseResponse<DynamicModel[]>>('api-admin/Report/GetUserReports')
}

export const createUserReport = async (payload: any) => {
  return $api.post<BaseResponse<CreateReportResult>>('api-admin/Report/CreateUserReport', payload)
}
