import { UserModel } from '@/services/user/model/user.model'
import { userService } from '@/services/user/user.service'
import { getErrorMessage } from '@/utils/functions'
import { defineStore } from 'pinia'
import { toast } from 'vue3-toastify'
import { useAuthStore } from './auth.store'
import { STRUCTURES } from '@/constants/structures'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserModel>()
  const isSidebarOpen = ref(true)
  const depozitBalance = ref(0)

  const authStore = useAuthStore()

  const getUser = async () => {
    try {
      const { data } = await userService.getUser()
      user.value = data.result
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    }
  }

  const isAdmin = computed(() => {
    const token = authStore.getToken()?.access_token!
    if (token) {
      const decoded: any = jwtDecode(token)
      return decoded.SysAdmin === 'True' ? true : false
    }
    return null
  })

  const getOrgId = computed(() => {
    const token = authStore.getToken()?.access_token!
    if (token) {
      const decoded: any = jwtDecode(token)
      return decoded.OrgId ? decoded.OrgId : decoded.sub
    }
    return null
  })

  const isFond = computed(() => {
    return user.value?.structureId === STRUCTURES.FOND
  })

  const isKassir = computed(() => {
    return user.value?.isKassir
  })

  const isOrganizer = computed(() => {
    return user.value?.structureId === STRUCTURES.ORGANIZER
  })

  const isSuperUser = computed(() => {
    return user.value?.structureId === STRUCTURES.SUPER_USER
  })

  const isEmitent = computed(() => {
    return user.value?.structureId === STRUCTURES.EMITENT
  })

  const isTheatre = computed(() => {
    return user.value?.structureId === STRUCTURES.TEATR
  })

  const isAgent = computed(() => {
    return user.value?.structureId === STRUCTURES.AGENT
  })

  const isMuseum = computed(() => {
    return user.value?.structureId === STRUCTURES.MUZEY
  })

  return {
    user,
    getUser,
    isSidebarOpen,
    isAdmin,
    isFond,
    isKassir,
    isOrganizer,
    isSuperUser,
    isEmitent,
    isTheatre,
    isAgent,
    isMuseum,
    getOrgId,
    depozitBalance
  }
})
