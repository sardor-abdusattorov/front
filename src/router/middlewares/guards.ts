import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { usePermissions } from '@/stores/permissions.store'

interface RouteMeta {
  layout?: 'default' | 'auth'
  permission?: string
}

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> => {
  const authStore = useAuthStore()
  const { hasPermission } = usePermissions()
  const name = to.name?.toString()
  const requiredPermission = (to.meta as RouteMeta).permission as string

  // // If user is not authenticated
  // if (!authStore.isAuthenticated) {
  //   if (!name?.includes('login')) return next('/login')
  //   return next()
  // }

  // // If user is not authenticated
  if (!authStore.isAuthenticated) {
    if (!name?.includes('login') && !name?.includes('register')) return next('/login')
    return next()
  }

  if (!authStore.isAuthenticated && name?.includes('register')) {
    return next('/register')
  }

  // If user is authenticated but doesn't have the required permission
  if (name !== 'index' && !hasPermission(requiredPermission)) return next('/')

  // If authenticated user tries to access login page
  if (name?.includes('login')) return next('/')

  // Default case, allow navigation
  next()
}
