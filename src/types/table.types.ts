export type TableRolesTypes =
  | 'text'
  | 'action'
  | 'btnAction'
  | 'checkbox'
  | 'image'
  | 'status'
  | 'phone'
  | 'date'
  | 'time'
  | 'scan'
  | 'sum'
  | 'preview'
  | 'color'
  | 'dataTime'
  | 'radio'
  | 'date-time'
  | 'render'
  | 'fiscal'
  | 'index'
  | 'langText'
  | 'statusLangText'
  | 'orgStatus'
  | 'invoiceStatus'

export type TableHeaderTypes = {
  text: string
  key: string
  role: TableRolesTypes
  id: number | string
  isVisible?: boolean | Function
  render?: Function
}
export type TableActionListType = { id: number; name: string; icon?: string; isVisible?: boolean | Function }
export type TablePaginationType = {
  page: number
  total: number
  setCustomClass?: boolean
  width?: string
  pageClickHandler: (page: number) => void
}
