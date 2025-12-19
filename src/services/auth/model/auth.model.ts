export interface LoginModel {
  result: LoginModelResult
  error: any
  id: any
}

export interface RegisterModel {
  result: any
  error: any
  id: any
}

export interface LoginModelResult {
  access_token: string
  refresh_token: string
  expires_in: number
  uielements?: string
}
