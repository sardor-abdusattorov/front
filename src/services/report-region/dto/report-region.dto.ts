export interface ReportRegionDto {
  museum: string
  palace: string
  from: string
  to: string
  items: Item[]
  count: number
}

interface Item {
  id: number
  name: string
  quantity: number
  sum: number
}
