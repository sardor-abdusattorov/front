export interface TarifDtoParam {
  eventSessionId: number
  skip: number
  take: number
}
export interface TarifEventDtoParam {
  eventId: number
  skip: number
  take: number
}

export interface CreateUpdatedTarifDto {
  eventId: number
  eventSessionId: number | null
  color: string
  name: string
  price: number | null
  id?: number
  forAgent: boolean
}

export interface TarifsIndexDto {
  id: number
  index: number
}
