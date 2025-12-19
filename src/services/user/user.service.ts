import { $api } from '@/utils/http'
import { UserModelResponse } from './model/user.model'

export const userService = {
  getUser() {
    return $api.get<UserModelResponse>('/api-admin/Management/userbytoken')
  }
}
