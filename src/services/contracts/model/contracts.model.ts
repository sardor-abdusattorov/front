import { CompanyDataDto, ContractsDto, ContractsStatusModelResult } from '@/services/contracts/dto/contracts.dto'

export interface ContractsModel {
  result: ContractsModelResult
}
export interface ContractsModelResult {
  data: ContractsDto[]
  total?: number
}
export interface ContractsStatusModel {
  result: ContractsStatusModelResult[]
}

export interface CompanyModelData {
  result: CompanyDataDto
}

export interface OrgModel {
  id: number
  name: string
  sHortName: string
  tin: string
  mfo: any
  regNumberNds: string
  director: any
  address: string
  phones: string
}

export interface ContractEDSInfoModel {
  id: number
  contractNumber: string
  contractDate: string
  endContractDate: string
  firstOrgModel: OrgModel
  secondOrgModel: OrgModel
  percent: string
}

export interface GetContractSignResult {
  contractEDSInfoModel: ContractEDSInfoModel
  signToHash: string
  signTimeFirst: any
  signTimeSecond: any
}
