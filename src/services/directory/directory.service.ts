import axios from 'axios'
import { $api } from '@/utils/http'
import { SOLIQ_URL } from '@/utils/config'
import { RegionDto } from '@/services/directory/dto/region.dto'
import { AgeLimitDto } from '@/services/directory/dto/age-limit.dto'
import { AgeLimitModelData, AgeLimitModelResult } from '@/services/directory/model/age-limit.model'
import { DistrictDto } from '@/services/directory/dto/district.dto'

//AGE_LIMIT
export const getAgeLimits = async (params: { skip: number, take: number }) => {
  return $api.get<BaseResponse<AgeLimitModelResult>>('api-admin/Reference/RefAgeLimitsPageGetAll', { params })
}

export const deleteAgeLimit = async (id: number) => {
  return $api.delete(`api-admin/Reference/RefAgeLimitsDelete/${id}`)
}

export const getAgeLimitById = async (id: number) => {
  return $api.get<BaseResponse<AgeLimitModelData>>(`api-admin/Reference/RefAgeLimitsGetById/${id}`)
}

export const createAgeLimit = (form: AgeLimitDto) => {
  return $api.post('api-admin/Reference/RefAgeLimitsAdd', form)
}
export const updateAgeLimit = (form: AgeLimitDto) => {
  return $api.put('api-admin/Reference/RefAgeLimitsUpdate', form)
}


//Region
export const getRegions = async (params: { skip: number, take: number }) => {
  return $api.get<BaseResponse<AgeLimitModelResult>>('api-admin/Reference/RefRegionPageGetAll', { params })
}
export const getCountries = async () => {
  return $api.get('api-admin/Reference/RefCountryGetAll')
}

export const deleteRegion = async (id: number) => {
  return $api.delete(`api-admin/Reference/RefRegionDelete/${id}`)
}

export const getRegionById = async (id: number) => {
  return $api.get<BaseResponse<AgeLimitModelData>>(`api-admin/Reference/RefRegionGetById/${id}`)
}

export const createRegion = (form: RegionDto) => {
  return $api.post('api-admin/Reference/RefRegionAdd', form)
}
export const updateRegion = (form: RegionDto) => {
  return $api.put('api-admin/Reference/RefRegionUpdate', form)
}

//District
export const getDistricts = async (params: { skip: number, take: number, regionId?: number }) => {
  return $api.get<BaseResponse<AgeLimitModelResult>>('api-admin/Reference/RefDistrictPageGetAll', { params })
}

export const deleteDistrict = async (id: number) => {
  return $api.delete(`api-admin/Reference/RefDistrictDelete/${id}`)
}

export const getDistrictById = async (id: number) => {
  return $api.get<BaseResponse<AgeLimitModelData>>(`api-admin/Reference/RefDistrictGetById/${id}`)
}

export const createDistrict = (form: DistrictDto) => {
  return $api.post('api-admin/Reference/RefDistrictAdd', form)
}
export const updateDistrict = (form: DistrictDto) => {
  return $api.put('api-admin/Reference/RefDistrictUpdate', form)
}


//System setup
export const getAllSetups = (params: { skip: number, take: number }) => {
  return $api.get('api-admin/Reference/RefConstPageGetAll', { params })
}
export const updateSetup = (form: any) => {
  return $api.put('api-admin/Reference/RefConstUpdate', form)
}

//MXIK
export const getAllSelected = (params?: { structureId?: number }) => {
  return $api.get('api-admin/Reference/GetAllSpic', { params })
}

export const getAllMXIK = (params: {
  type: number,
  lang: string,
  page: number,
  size: number,
  search_text?: string | null,
  mxikCode?: string | null,
  shtrixCode?: string | null
}) => {
  return axios.get(SOLIQ_URL, { params })
}

export const updateMXIK = (form: any) => {
  return $api.put('api-admin/Reference/UpdateSpic', form)
}
export const deleteMXIK = (id: number) => {
  return $api.delete(`api-admin/Reference/DeleteSpic?id=${id}`)
}

export const getStructures = () => {
  return $api.get('api-admin/List/GetStructureList')
}
export const addMXIK=(form:any)=>{
  return $api.post('api-admin/Reference/AddSpic',form)
}
