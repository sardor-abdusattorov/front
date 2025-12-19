import { $api } from '@/utils/http'
import { LoginDto, RegisterDto } from './dto/auth.dto'
import { LoginModel, RegisterModel } from './model/auth.model'

export const authService = {
  login(dto: LoginDto) {
    return $api.post<LoginModel>('/api-auth/Login/Token', dto)
  },

  register(dto: RegisterDto) {
    return $api.post<RegisterModel>('/api-company/Company/CompanyReg', dto)
  },

  refreshToken(token: string) {
    return $api.get<LoginModel>('/api-auth/Login/Token', {
      params: {
        refreshtoken: token
      }
    })
  },

  logout(token: string) {
    return $api.delete('/api-auth/Login/Logout', {
      params: {
        refreshtoken: token
      }
    })
  },

  getExistingAccount(tin: number) {
    return $api.get('/api-company/Company/GetCompanyDataWithTin', {
      params: {
        tin
      }
    })
  }
}
