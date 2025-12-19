import { AdminDto, AdminRoleDto, AdminTurniketDto } from '@/services/administration/dto/admin.dto'

export interface AdminModel {
  result: AdminModelResult
}
export interface AdminModelResult {
  data: AdminDto[]
  total?: number
}

export interface AdminRoleModel {
  result: AdminRoleModelResult
}
export interface AdminRoleModelResult {
  data: AdminRoleDto[]
  total?: number
}
export interface AdminTurniketModel {
  result: AdminTurniketModelResult
}
export interface AdminTurniketModelResult {
  data: AdminTurniketDto[]
  total?: number
}

export interface OtherUserPageData {
  id: number
  login: string
  password: any
  firstName: any
  lastName: any
  middleName: any
  email: string
  inn: any
  telefon: any
  photo: any
  organizationId: number
  organizationName: string
  active: boolean
  isAdmin: boolean
  isKassir: boolean
  palaceId: any
  structureName: string
  structureId: number
}

export interface OtherUserPageResponse {
  data: OtherUserPageData[]
  total: number;
}
