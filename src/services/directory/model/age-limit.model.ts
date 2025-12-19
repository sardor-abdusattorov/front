export interface AgeLimitModelResult {
  data: AgeLimitModelData[]
  total?: number
}

export interface AgeLimitModelData {
  id: number
  name: string
  comment: string
}
