export interface LoginDto {
  client_id: string
  login: string
  password: string
}

export interface RegisterDto {
  organizationName: string
  userFullName: string
  name: string
  tin: number
  regionId: string
  districtId: string
  login: string
  password: string
  confirmPassword: string
  userFirstName: string
  userLastName: string
  userMiddleName: string
  userPosition: string
  userInn: string
  email: string
  telefon: string
  address: string
  webSite: string
  userPINFL: string
  licenseNumber: string
  dsKeyNumber: string
  dsKeySerial: string
}
