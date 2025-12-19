export interface InvoicePageGetAllDto {
  skip: number
  take: number
  organizationId: number | string
}

export interface ClearingCreateInvoiceDto {
  buyerAcc: string
  buyerMFO: string
  buyerOrgId: number
  currencyId: number
  dpcNumber: string
  invoiceDate: string
  paymentCode: string
  remark: string
  sellerAcc: string
  sellerMfo: string
  summa: number
}

export interface ClearingUpdateInvoiceDto extends ClearingCreateInvoiceDto {
  id: number
}

type CARD = 1
type ACCOUNTING = 2
type CASH_PAYMENT = 3

export type PaymentType = CARD | ACCOUNTING | CASH_PAYMENT
