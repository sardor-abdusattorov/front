export interface InvoicePageGetAllData {
  id: number
  docNumber: string
  buyerMFO: string
  buyerInn: string
  buyerAcc: string
  summa: number
  sellerMfo: string
  sellerInn: string
  sellerAcc: string
  remark: string
  invoiceDate: string
  realTime: string
  currencyId: number
  paymentCode: string
  inOutStatus: number
  isApprove: boolean
  buyerOrgId: number
}

export interface InvoicePageGetAllResult {
  data: InvoicePageGetAllData[]
  count: number
}

export interface ClearingGetByIdResult extends InvoicePageGetAllData {}
