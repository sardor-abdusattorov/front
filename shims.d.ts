export {}

declare global {
  interface BaseResponse<T> {
    statusCode: number
    result: T
    error: any
    id: any
  }
}
