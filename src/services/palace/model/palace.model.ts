import { PalaceDto } from '@/services/palace/dto/palace.dto'

export interface PalaceModel {
  result: PalaceModelResult
}
export interface PalaceModelResult {
  data: PalaceDto[]
  total?: number
}

export interface PalaceHallModel {
  id: number
  name: string
  palaceId: number
  photos: any
  svgText: string
  created: string
  createdUserId: number
  isActive: boolean
  confirmationFile: any
}

export interface AllPalaceModelResult {
  data: AllPalaceModel[]
  total: number
}

export interface AllPalaceModel {
  id: number
  isActive: boolean
  name: string
  palaceId: number
  palaceName: string
  emitentName: string
}

export interface Seat {
  seatId: number
  row: string
  number: string
}

export interface Sector {
  name: string
  seat: Seat[]
}
