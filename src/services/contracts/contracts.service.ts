import { $api } from '@/utils/http'
import { CompanyModelData, ContractsModel, GetContractSignResult } from '@/services/contracts/model/contracts.model'
import { GetReferencesDataModel } from '@/services/events/model/events.model'
import { GetContractSignDto, PutContractSignDto, RejectContractDto } from '@/services/contracts/dto/contracts.dto'

export const getContractTable = async (params?: {} | null) => {
  return $api.get<ContractsModel>('api-company/Contract/Contract', {
    params
  })
}
export const getMyContractTable = async (params?: {} | null) => {
  return $api.get<ContractsModel>('api-company/Contract/GetMyContracts', {
    params
  })
}

export const getContractFiles = async (item: string) => {
  return $api.post(
    'api-company/Contract/GetContractFile',
    { filePath: item },
    {
      responseType: 'blob'
    }
  )
}

export const getTemplateFiles = async (item: string) => {
  return $api.post(
    'api-company/Contract/GetContractTemplateFile',
    { filePath: item },
    {
      responseType: 'blob'
    }
  )
}

export const getStatusItems = async () => {
  return $api.get(`api-company/Contract/ContractStatuses`)
}

export const getCompanyData = async () => {
  return $api.get<CompanyModelData>('api-company/Company/CompanyGet')
}
export const geContractStructure = async () => {
  return $api.get('api-company/Contract/Structure')
}
export const getContractById = async (id: number) => {
  return $api.get(`api-company/Contract/ContractById/id?id=${id}`)
}
export const getOrganizations = async (id: number | null) => {
  return $api.get(`api-company/Contract/Organization?structureId=${id}`)
}

export const getTourAgentList = async () => {
  return $api.get('api-company/Contract/Organization?structureId=9')
}

export const createContract = async (form: any) => {
  return $api.post('api-company/ContractAbonent/PostContract', form)
}

export const createTemplate = async (form: any) => {
  return $api.post('api-company/Contract/CreateContractTemplate', form)
}

export const getActiveContractTemplates = async (params: any) => {
  return $api.get('api-company/Contract/GetActiveContractTemplates', {
    params
  })
}

export const updateContract = async (form: any) => {
  return $api.put(`api-company/ContractAbonent/PutContract`, form)
}

export const getContractAbonentEvents = async (organizatorId: any) => {
  return $api.get(`api-company/ContractAbonent/Events`, {
    params: { organizatorId }
  })
}

export const createMyContract = async (form: any) => {
  return $api.post('api-company/Contract/PostContract', form)
}

export const updateMyContract = async (form: any) => {
  return $api.put('api-company/Contract/PutContract', form)
}

export const updateSendContractId = async (id: number) => {
  return $api.put(`api-company/Contract/SendContract?id=${id}`)
}

export const getRoles = async () => {
  return $api.get<GetReferencesDataModel>('api-admin/Management/roles')
}
export const contractAnulled = async (id: number) => {
  return $api.put<BaseResponse<{ success: boolean }>>('api-company/Contract/ContractAnnuled', null, {
    params: { id }
  })
}

export const getContractSign = async (params: GetContractSignDto) => {
  return $api.get<BaseResponse<GetContractSignResult>>('api-company/Contract/GetContractSign', {
    params
  })
}

export const getContractTemplateContractSign = async (params: GetContractSignDto) => {
  return $api.get<BaseResponse<GetContractSignResult>>('api-company/Contract/GetContractTemplateSign', {
    params
  })
}

export const PutContractTemplateSign = async (signData: PutContractSignDto) => {
  return $api.put('api-company/Contract/PutContractTemplateSign', signData)
}

export const putContractSign = async (signData: PutContractSignDto) => {
  return $api.put('api-company/Contract/PutContractSign', signData)
}

export const rejectContractSign = async (params: RejectContractDto) => {
  return $api.put('api-company/Contract/RejectContract', null, {
    params
  })
}

export const acceptContract = async (id: number) => {
  return $api.put('api-company/Contract/ApproveContract', null, {
    params: { id }
  })
}

export const deActiveContractTemplate = async (contractId: number) => {
  return $api.put(`api-company/Contract/DeActivateContractTemplate/${contractId}`)
}

export const getActiveContractTemplateFile = async (params: any) => {
  return $api.post('api-company/Contract/GetActiveContractTemplateFile', null, {
    responseType: 'blob',
    params
  })
}