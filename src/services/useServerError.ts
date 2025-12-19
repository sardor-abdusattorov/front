export const useServerError = () => {
  const getFieldErrors = (e: { response?: { data?: { errors?: Record<string, string> } } }) => {
    if (e?.response?.data?.errors) return e.response.data.errors

    return {}
  }

  return {
    getFieldErrors
  }
}
