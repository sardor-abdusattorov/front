import { $api } from '@/utils/http'
import { OtherUserPageData, OtherUserPageResponse } from '@/services/administration/model/admin.model'
import { OtherUserPageListDto } from '@/services/administration/dto/admin.dto'
import { AdminModel, AdminRoleModel, AdminTurniketModel } from '@/services/administration/model/admin.model'
import { createRoleFormDto, CreateUserFormDto, userRoleDto } from '@/services/administration/dto/admin.dto'

export const getUserList = (params: any) => {
  return $api.get<AdminModel>('/api-admin/Management/UserPageGetAll', { params })
}
export const getRoleList = (params: any) => {
  return $api.get<AdminRoleModel>('/api-admin/Management/RolePageGetAll', { params })
}
export const getTurniketUserList = (params: any) => {
  return $api.get<AdminTurniketModel>('/api-admin/Management/turniket-user-list', { params })
}
export const getPalaceListByFond = (params: any) => {
  return $api.get('/api-admin/List/GetPalaceListByFondAndOrg', { params })
}
export const getPalaceHallGetAll = (id: number) => {
  return $api.get(`/api-admin/Palace/PalaceHallGetAll?palaceId=${id}`)
}
export const getAllPermission = () => {
  return $api.get('/api-admin/Management/all-permissions')
}
export const getSuperVisiourList = () => {
  return $api.get('/api-admin/List/GetSupervisorList')
}

export const createRoleName = (form: { name: string }) => {
  return $api.post('/api-admin/Management/role', form)
}
export const updateRoleName = (form: { id: number; name: string }) => {
  return $api.put('/api-admin/Management/role', form)
}

export const createRole = async (form: createRoleFormDto[]) => {
  return $api.post('/api-admin/Management/role-permission', form)
}
export const deleteRolePermission = (id: number) => {
  return $api.delete(`/api-admin/Management/role-permission/${id}`)
}
export const deleteRole = (id: number) => {
  return $api.delete(`/api-admin/Management/role/${id}`)
}
export const getRolePermission = (id: number) => {
  return $api.get(`/api-admin/Management/role/${id}`)
}

export const getPermissionListById = (id: number) => {
  return $api.get(`/api-admin/Management/role-permissions?roleId=${id}`)
}

export const createTurniketUser = (form: any) => {
  return $api.post('/api-admin/Management/turniket-user', form)
}
export const updateTurniketUser = (form: any) => {
  return $api.put('/api-admin/Management/turniket-user', form)
}
export const getTurniketUserById = (id: number) => {
  return $api.get(`/api-admin/Management/turniket-user/${id}`)
}
export const deleteTurniketUser = (id: number) => {
  return $api.delete(`/api-admin/Management/turniket-user/${id}`)
}

export const createUser = (form: CreateUserFormDto) => {
  return $api.post('/api-admin/Management/user', form)
}
export const updateUser = (form: CreateUserFormDto) => {
  return $api.put('/api-admin/Management/user', form)
}

export const createUserRole = (form: userRoleDto) => {
  return $api.post('/api-admin/Management/user-role', form)
}
export const updateUserRole = (form: userRoleDto) => {
  return $api.put('/api-admin/Management/user-role', form)
}

export const deleteUserRole = (id: number) => {
  return $api.delete(`/api-admin/Management/user-role/${id}`)
}

export const deleteUser = (id: number) => {
  return $api.delete(`/api-admin/Management/user/${id}`)
}

export const getUserById = (id: number) => {
  return $api.get(`/api-admin/Management/User/${id}`)
}

export const getOtherUserById = (id: number) => {
  return $api.get<BaseResponse<OtherUserPageData>>(`/api-admin/Management/otherUser/${id}`)
}

export const getUserRoleId = (id: number) => {
  return $api.get(`/api-admin/Management/roles-by-userid/${id}`)
}

export const updateTurniketActivate = (id: number, status: boolean) => {
  return $api.put(`/api-admin/Management/turniket-user-activate?id=${id}&status=${status}`)
}

export const getAllOtherUserList = async (params: OtherUserPageListDto) => {
  return $api.get<BaseResponse<OtherUserPageResponse>>('api-admin/Management/OtherUserPageGetAll', {
    params
  })
}

export const changeUserStatus = async (id: number, status: boolean) => {
  return $api.put(`/api-admin/Management/ChangeStatus?userId=${id}&isActive=${status}`)
}
