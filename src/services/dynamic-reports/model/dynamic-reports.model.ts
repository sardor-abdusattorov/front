export interface DynamicModel {
  id: number
  modelName?: string
  nameUz: string
  nameEn: string
  nameRu: string
  descriptionUz?: string
  descriptionEn?: string
  descriptionRu?: string
}

export interface DynamicTableModel extends DynamicModel {
  tableName: string
}
export interface DynamicColumnModel extends DynamicModel {
  columnName?: string
  tableId?: number
  foreignTableId?: number | null
  colSpan?: number
  rowSpan?: number
  isCountable?: boolean
  isFilterable?: boolean
  isGroupable?: boolean
  isOrderable?: boolean
  isSortable?: boolean
  isSummable?: boolean
  hasFilter?: boolean
  isDistinct?: boolean
  value?: string[]
  filterInputType: number | null
  typeName?: string
}

export interface DynamicColumnModelChild {
  parentid: number
  lists: DynamicColumnModel[]
}

export interface CreateReportResult {
  file: FileReportsModel
  info: InfoReportsModel
}

export interface FileReportsModel {
  fileContents: string
  contentType: string
  fileDownloadName: string
  lastModified: any
  entityTag: any
  enableRangeProcessing: boolean
}

export interface InfoReportsModel {
  id: number
  count: number
  filters: FilterReportsModel[]
}

export interface FilterReportsModel {
  id: number
  rowSpan: number
  colSpan: number
  nameUz: string
  nameEn: string
  nameRu: string
  hasFilter: boolean
  filterInputType: any
}
