import { CompanyByStructureListDto, CreateOrganizationDto } from '../dto/organization.dto'

export interface CompanyByStructureList {
  result: CompanyByStructureResult
}

export interface OtherUserPageGetAllSingle {
  id: number
  login: string
  password: string
  firstName: string
  lastName: string
  middleName: string
  email: string
  inn: any
  telefon: string
  photo: any
  organizationId: number
  organizationName: string
  active: boolean
  isAdmin: boolean
  isKassir: boolean
  palaceId: number
  structureName: string
  structureId: number
}

export interface CompanyByIdResult extends CreateOrganizationDto {}

export interface CompanyByStructureResult {
  data: CompanyByStructureListDto[]
  total: number
}

export interface CompanyAllList {
  value: number
  text: string
}

export interface GetOtherUserPageGetAllResult {
  data: OtherUserPageGetAllSingle[]
  total: number
}

export interface CompanyPaymentType {
  id: number
  name: string
  typeName: string
  comment: any
  isSelected: boolean
}
