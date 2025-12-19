// import { EXPIRES_TOKEN_DATE, REFRESH_TOKEN, TOKEN } from '@/constants/auth'

import { defineStore } from 'pinia'
import { toast } from 'vue3-toastify'
import Cookies from 'universal-cookie'
import type { CookieSetOptions } from 'universal-cookie'
import { LoginModelResult } from '@/services/auth/model/auth.model'
import { getErrorMessage } from '@/utils/functions'
import { authService } from '@/services/auth/auth.service'
import { LoginDto, RegisterDto } from '@/services/auth/dto/auth.dto'

export const useAuthStore = defineStore('auth', () => {
  const cookies = new Cookies(null)
  const BEARER_TOKEN_KEY = 'act-bearer'

  const isAfterLogin = ref(false)

  const setToken = (token: LoginModelResult) => {
    const options: CookieSetOptions = {
      path: '/'
    }
    cookies.set(BEARER_TOKEN_KEY, token, options)
    return token
  }

  const setRefreshToken = (token: string) => {
    localStorage.setItem('_rt', token)
  }

  const getToken = (): LoginModelResult | null => {
    return cookies.get(BEARER_TOKEN_KEY) || null
  }

  const removeToken = async () => {
    const options: Record<string, string> = {
      path: '/'
    }
    cookies.remove(BEARER_TOKEN_KEY, options)
    try {
      await authService.logout(localStorage.getItem('_rt') || '')
    } catch (err: any) {
      console.error(err)
    }
    localStorage.removeItem('_rt')
  }
  const logout = async () => {
    await removeToken()
    window.location.href = '/login'
  }

  const register = async (dto: RegisterDto) => {
    const { data } = await authService.register(dto)
    return data
  }

  const getExistingAccount = async (tin: number) => {
    const { data } =  await authService.getExistingAccount(tin)
    return data
  }

  const refreshToken = async (token: LoginModelResult) => {
    setToken(token)
    setRefreshToken(token.refresh_token)
  }

  const login = async (dto: LoginDto) => {
    try {
      const { data } = await authService.login(dto)
      setToken(data.result)
      setRefreshToken(data.result.refresh_token)
      window.location.href = '/'
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    }
  }
  const checkAfterLogin = (t: Function) => {
    if (isAfterLogin.value) {
      toast.success(t('toast.success_login'))
      isAfterLogin.value = false
    }
  }
  const isAuthenticated = computed(() => !!getToken()?.access_token)

  return {
    getToken,
    isAuthenticated,
    isAfterLogin,
    login,
    logout,
    checkAfterLogin,
    register,
    refreshToken,
    getExistingAccount
  }
})
