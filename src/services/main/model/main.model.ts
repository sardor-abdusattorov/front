import { MainDto, MainProfitDto } from '@/services/main/dto/main.dto'

export interface MainModel {
  result: MainDto
}

export interface MainProfitModel {
  result: MainProfitDto[]
}

export interface OrderEvents {
  org_id: number
  org_name: string
  utgan_vaqti: string
  palace_name: string
  event_name: string
  session_name: string
  user_name: string
  count_ticket: number
  summa: number
}
