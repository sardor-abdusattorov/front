import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { API_URL, CASHIER_URL } from '@/utils/config'
import { authService } from '@/services/auth/auth.service'
import { LoginModelResult } from '@/services/auth/model/auth.model'
import Cookies from 'universal-cookie'
import type { CookieSetOptions } from 'universal-cookie'

const cookies = new Cookies(null)
const BEARER_TOKEN_KEY = 'act-bearer'

const setToken = (token: LoginModelResult) => {
  const options: CookieSetOptions = {
    path: '/'
  }
  cookies.set(BEARER_TOKEN_KEY, token, options)
  return token
}

const removeToken = () => {
  const options: Record<string, string> = {
    path: '/'
  }
  cookies.remove(BEARER_TOKEN_KEY, options)
  localStorage.removeItem('_rt')
}

declare module 'axios' {
  export interface AxiosRequestConfig {}
}

export const $api = axios.create({ baseURL: API_URL })

export const $blob = axios.create({
  baseURL: API_URL,
  responseType: 'blob'
})

$api.interceptors.request.use((config) => {
  const { getToken } = useAuthStore()
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token.access_token}`
  return config
})

$blob.interceptors.request.use((config) => {
  const { getToken } = useAuthStore()
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token.access_token}`
  return config
})

export const $http = axios.create({ baseURL: CASHIER_URL })

$http.interceptors.request.use((config) => {
  const { getToken } = useAuthStore()
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token.access_token}`
  return config
})

$api.interceptors.response.use(
  (config) => {
    return config
  },
  async (error: any) => {
    const originalRequest = error.config
    if (error.response.status == 401 && error.config && !error.config._isRetry) {
      originalRequest._isRetry = true
      try {
        const response = await authService.refreshToken(localStorage.getItem('_rt') || '')
        if (response.data.result) {
          const newAccessToken = response.data.result.access_token

          setToken(response.data.result)
          localStorage.setItem('_rt', response.data.result.refresh_token)

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

          return axios.request(originalRequest)
        } else {
          removeToken()
          window.location.href = '/login'
        }
      } catch (e) {
        console.log(e)
        removeToken()
        window.location.href = '/login'
      }
    }
    throw error
  }
)
