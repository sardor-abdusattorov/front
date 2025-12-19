import { ApplicationDto } from '@/services/events/dto/application.dto'

export interface ApplicationModel {
  result: ApplicationResult
}

export interface ApplicationResult {
  data: ApplicationDto[]
  total: number
}
