export interface UserModelResponse {
  statusCode: number
  result: UserModel
  error: any
  id: any
}

export interface UserModel {
  id: number
  login: string
  password: any
  firstName: string
  lastName: string
  middleName: string
  email: string
  inn: string
  telefon: string
  photo: any
  organizationId: number
  organizationName: string
  active: boolean
  isAdmin: boolean
  isKassir: boolean
  palaceId: any
  structureId: number
}
