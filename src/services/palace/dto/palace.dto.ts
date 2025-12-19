export interface PalaceDto {
  id: number
  name: string
  regionId: number
  regionName: string
  districtId: number
  districtName: string
  address: string
  isActive: boolean
  isEveryDay: boolean
  phone: string
  startWork: string
  endWork: string
  photos: string
  structureId: number
  isPalaceHall: boolean
  orgName: string
  palaceStatusId: number
  palaceStatusName: string
  rejectReason?: any
}

export interface PalaceCreateDto {
  address: string
  content: string
  cordinataX: number | null
  cordinataY: number | null
  districtId: number | null
  endWork?: string | null
  name: string
  orgId: string | null
  phone: string
  photos: string
  regionId: number | null
  startWork?: string | null
  structureId: string
  id?: number
}

export interface PalaceHallAllParams {
  palaceId: number
  searchText: string
  skip: number
  take: number
}

export interface PalaceHallDto {
  id?: number
  name: string
  isActive: boolean
  confirmationFile: string
  palaceId: number
  svgJson: string
  svgText: string
}
