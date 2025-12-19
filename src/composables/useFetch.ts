import { ref } from 'vue'

interface FetchOptions<T = undefined> {
  immediately?: boolean
  defaultData?: T
}

export function useFetchData<T = any, P = any>(
  fc: (p?: P) => Promise<{ data?: T; error?: any }>,
  options: FetchOptions<T> = {}
) {
  const loading = ref(false)
  const data = ref<T>()
  if (options.defaultData) data.value = options.defaultData
  const error = ref<any>()
  const fetch = async (p?: P) => {
    error.value = null
    loading.value = true
    const { data: responseData, error: errorResponse } = await fc(p)
    if (responseData) data.value = responseData
    if (errorResponse) error.value = errorResponse
    loading.value = false
  }

  const setLoading = (b: boolean) => {
    loading.value = b
  }

  if (options.immediately) fetch().then()

  return { data, loading, error, setLoading, fetch }
}
