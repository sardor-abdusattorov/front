import { RouteLocationRaw } from 'vue-router'

export interface NavigatorChild {
  title: string
  icon: any
  to: string
  exact?: boolean
  isGroup?: boolean
  isPermitted: boolean
  subChildren?: NavigatorChild[]
}

export interface Navigator {
  title: string
  icon: any
  to: RouteLocationRaw
  exact?: boolean
  isGroup: boolean
  isPermitted: boolean
  children?: NavigatorChild[]
  badge?: number
  notification?: number
}
