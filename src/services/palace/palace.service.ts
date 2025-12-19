import { $api } from '@/utils/http'
import { AllPalaceModelResult, PalaceHallModel, PalaceModel } from '@/services/palace/model/palace.model'
import { PalaceCreateDto, PalaceHallAllParams, PalaceHallDto } from '@/services/palace/dto/palace.dto'
import { STRUCTURES } from '@/constants/structures'
import { useUserStore } from '@/stores/user.store'

const store = useUserStore()

export const getPalaceTable = async (params?: {} | null) => {
  if (store.user?.structureId === STRUCTURES.SUPER_USER)
    return $api.get<PalaceModel>('api-superuser/Palace/PalacePageGetAll/SuperUserPalacePageGetAll', {
      params
    })
  else {
    return $api.get<PalaceModel>('api-admin/Palace/PalacePageGetAll', {
      params
    })
  }
}

export const getPalaceRemove = async (id: number) => {
  return $api.delete<PalaceModel>(`api-admin/Palace/PalaceDelete/${id}`)
}
export const getPalaceById = async (id: number) => {
  return $api.get<PalaceModel>(`api-admin/Palace/PalaceGetById/${id}`)
}

export const sendPalaceToFond = async (palaceId: number) => {
  return $api.put<BaseResponse<{ success: boolean }>>(`api-admin/Palace/PalaceSend`, null, { params: { palaceId } })
}

export const createPalace = async (form: PalaceCreateDto) => {
  return $api.post('api-admin/Palace/PalaceAdd', form)
}
export const updatePalace = async (form: PalaceCreateDto) => {
  return $api.put('api-admin/Palace/PalaceUpdate', form)
}
export const getPalaceHallById = async (id: number) => {
  return $api.get<BaseResponse<PalaceHallModel>>(`api-admin/Palace/PalaceHallGetById/${id}`)
}

export const getPalaceHallPageGetAll = async (params: PalaceHallAllParams) => {
  return $api.get<BaseResponse<AllPalaceModelResult>>('api-admin/Palace/PalaceHallPageGetAll', { params })
}
export const palaceHallDelete = async (id: number) => {
  return $api.delete<BaseResponse<{ success: boolean }>>(`api-admin/Palace/PalaceHallDelete/${id}`)
}
export const palaceHallCreate = async (form: PalaceHallDto) => {
  return $api.post<BaseResponse<{ success: boolean }>>(`api-admin/Palace/PalaceHallAdd`, form)
}

export const palaceHallUpdate = async (form: PalaceHallDto) => {
  return $api.put<BaseResponse<{ success: boolean }>>(`api-admin/Palace/PalaceHallUpdate`, form)
}

export const palaceApproveById = (palaceId: number) => {
  return $api.put<BaseResponse<{ success: boolean }>>(`api-admin/Palace/PalaceApprove`, null, { params: { palaceId } })
}

export const palaceRejectById = (palaceId: number, rejectReason: string) => {
  return $api.put<BaseResponse<{ success: boolean }>>(`api-admin/Palace/PalaceReject`, null, {
    params: { palaceId, rejectReason }
  })
}
