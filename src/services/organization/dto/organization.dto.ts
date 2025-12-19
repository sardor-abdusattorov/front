export interface CompanyStructureListDto {
  value: number
  text: string
}

export interface CompanyByStructureListDto {
  id: number
  accountant: string
  address: string
  comment: any
  createdDate: string
  createdUser: number
  director: any
  districtId: number
  dsKeyNumber: any
  dsKeySerial: any
  faxPhones: string
  files: string
  images: any
  isActive: boolean
  isEsp: boolean
  name: string
  oked: string
  okonh: string
  parentId: any
  personalAccountClearing: string
  phones: string
  photos: any
  regNumberNds: string
  regionId: number
  structureId: number
  tin: string
  structureName: string
  debtLimit: any
  haveCashbox: boolean
  saldo: any
  isTaxpayer: boolean
  vat: number
  statusId: number
}

export interface OtherUserPageGetAllDto {
  skip: number
  take: number
  search: string
  isAdmin: boolean
  isKassir: boolean
  companyId: number
}

export interface CreateOrganizationDto {
  name: string
  tin: string
  regionId: number | undefined
  districtId: number | undefined
  structureId: number | undefined // This is the structureId of the organization like - Theater, Museum, etc.
  regNumberNds: string
  okonh: string
  oked: string
  files?: string // This is the file path like - /orgfiles/1234567890.jpg
  accountant: string // This is the name of the accountant - FIO Bugaltera
  address: string
  comment: string
  haveCashbox: boolean
  debtLimit: number // Лимит долга
  faxPhones: string
  phones: string
  email: string
  userPosition: string
  userLastName: string
  userMiddleName: string
  userFirstName: string
  userInn: string
  login: string
  password: string
  confirmPassword: string
  isActive: boolean
  isForeign: boolean // Иностранная организация
  isTaxpayer: boolean // Налогоплательщик
  vat: number // Процент налога
  parentId: any
}
