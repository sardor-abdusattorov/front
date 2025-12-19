import { API_URL } from '@/utils/config'
export const useResource = () => {

  const getFileUrl = (url: string) => {
    url = url.replace(';', '')
    return `${API_URL}/${url}`
  }

  return {
    getFileUrl,
  }
}
