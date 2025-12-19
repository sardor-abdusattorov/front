export interface ContractsDto {
  id: number
  contractNumber: string
  contractDate: string
  endContractDate: string
  contractStatusId: number
  contractStatusName: string
  rejectReason: string | null
  contractFile: string | null
  firstOrgId: number
  firstOrgName: string
  structureId: number
  secondOrgId: number
  secondOrgName: string
  isPercentInBilet: boolean
  percent: number
  comment: string
  eventId: number | null
  eventName: string | null
  isInitiator: boolean
  contractActions: number[]
}
export interface ContractsStatusModelResult {
  value: number
  text: string
}

export interface CompanyDataDto {
  tin: string
  address: string
  name: string
  id?: number
  sHortName?: string
  firstName: string
  lastName: string
  position: string
  userName: string
  middleName: string
  inn: string
}

export interface CreateContractDto {
  contractNumber: string
  structureId: null | any
  secondOrgId: number | null
  contractDate: Date | string | null
  endContractDate: Date | string | null
  comment: string
  percent: number | null
  isPercentInBilet: boolean
  id: number | null | undefined
  document: any
  contractFiles: undefined | []
  filePath?: string
  parentId?: number | null
  eventId?: number | null
}

export interface GetContractSignDto {
  contractId: number
}

export interface PutContractSignDto {
  address: string
  contractId: number
  fullName: string
  organizationName: string
  signToHash: string
}

export interface RejectContractDto {
  id: number
  rejectReason: string
}
