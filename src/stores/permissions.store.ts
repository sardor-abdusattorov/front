import { defineStore } from 'pinia'
import Cookies from 'universal-cookie'

export const usePermissions = defineStore('permissions', () => {
  const cookies = new Cookies(null)
  const BEARER_TOKEN_KEY = 'act-bearer'

  const hasPermission = (permission: string) => {
    if (!permission) return false
    const permissions = getPermissions()
    return permissions.includes(permission)
  }

  const getPermissions = () => {
    return cookies.get(BEARER_TOKEN_KEY)?.uielements.split(',').filter(Boolean) || []
  }

  return {
    hasPermission,
    getPermissions
  }
})
