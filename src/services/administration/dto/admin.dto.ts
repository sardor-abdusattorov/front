export interface AdminDto {
  id: number
  login: string
  password: string
  firstName: string
  lastName: string
  middleName: string
  email: string
  inn: string
  telefon: string
  photo: string
  organizationId: number
  organizationName: string
  active: boolean
  isAdmin: boolean
  isKassir: boolean
  palaceId: number
  structureName: string
}

export interface AdminRoleDto {
  comment: string | null
  id: number
  name: string
  orgId: number
  createDate: string
  createUser: number
}
export interface AdminTurniketDto {
  active: boolean
  createdDate: string
  id: number
  login: string
  palaceHallList: string
  palaceHallNames: string
  palaceId: number
  palaceName: string
  validationMinutes: number
}

export interface createRoleFormDto {
  permissionId: number | null
  roleId: number | null
  id: number | null
}

export interface CreateUserFormDto {
  firstName: string
  lastName: string
  middleName: string
  telefon: string
  isKassir: boolean
  email: string
  login: string
  password: string
  active: boolean
  palaceId: number | null
  isAdmin: boolean
  photo: string
  isAccountant: boolean | null
}
export interface userRoleDto {
  id: number
  roleId: number | null
  userId: number
}

export interface OtherUserPageListDto {
  skip?: number
  take?: number
  search: string
  isAdmin: boolean | null
  isKassir: boolean | null
  companyId?: number
}
