export interface EventsDto {
  id: number
  orgName: string
  organizator: string
  creator: string
  name: string
  eventStatusId: number
  eventStatusName: string
  rejectReason: string
  palaceName: string
  abonentTypeId: number
  abonentTypeName: string
  ticketPrice: number | null
  eventBegin: string
  eventEnd: string
  created: string
  createdBy: string
  isSellBlock: boolean
  isVerificationUser: boolean
  invitationCount: number
  shortName: string
  spic: string
  packageCode: string
}

export interface CreateEventModel {
  id?: number
  abonentStructureId: number
  organizatorName: string
  orgId: number
  eventOrgId: number
  palaceId: number
  palaceHallId: number
  eventTypeId: number
  name: string
  shortName: string
  content: string
  beginDate: string
  endDate: string
  ageLimitId: number
  eventMinute: number
  announcementBegin: any
  announcementEnd: any
  pictureBanner: string
  active: boolean
  isEventPrivileges: boolean
  isRejectTicket: boolean
  isVerificationUser: boolean
  eventStatus: number
  rejectReason: any
  ticketValidity: any
  ticketPrice: any
  isSellBlock: boolean
  privilegesRound: number
  invitationCount: number
  isUseDiscountToPrivileges: boolean
  isBookingEventOrg: boolean
  bookingCountEventOrg: number
  bookingTimeEventOrg: number
  isBookingAgent: boolean
  bookingCountAgent: number
  bookingTimeAgent: number
  spic: string
  packageCode: string
}

export interface GetReferencesDto {
  createdAt: string
  description: string | null
  id: number
  internalCode: number | null
  isMain: boolean
  label: number
  name: string
  packages: GetReferencesPackagesDto[]
  spic: string
  structureId: number
  updatedAt: null | string
  usePackage: number
}

export interface GetReferencesPackagesDto {
  code: string
  createdAt: string
  id: number
  isMain: boolean
  nameLat: string
  nameRu: string
  nameUz: string
  packageType: number
  spic: string
  updatedAt: string | null
}

export interface AddEventRejectRatesDto {
  eventId: number | null
  list: AddEventRejectRatesListDto[]
}
export interface AddEventBenDto {
  name: string
  rate: number | null
  submit: boolean
  eventId: number | null
  helperId: number | null
}

export interface AddEventRejectRatesListDto {
  eventId: number | null
  helperId?: number
  hour: number | null
  percent: number | null
  submitTicketReject: boolean
  isEdited?: boolean
  eventName?: string
  id?: number
}

export interface AddEventPrivilegesDto {
  eventId: number
  helperId?: number
  name: string | null
  rate: number | null
  submit?: boolean
  id?: number
  isEdited?: boolean
  eventName?: string
}
export interface PutEventPrivilegesRoundWithDiscountDto {
  eventId: number
  privilegesRound: string | null
  isUseDiscountToPrivileges: boolean | null
}

export interface AgentList {
  agentName: string
  percentInBilet: number
  percentOutBilet: number
  requestStatusId: number
  name: string
  agentId?: number
  requestSended?: boolean
  isSelected?: boolean
}

export interface SessionFormDto {
  name: string
  eventBegin: Date | null
  beginSale: Date | null
  endSale: Date | null
  eventEnd: Date | null
  active: boolean
  eventId: number
  id?: number
}

export interface ConfirmEventByFondDto {
  id: number
  EventId: number
  isVerificationUser: boolean
  IsBookingEventOrg: boolean
  BookingCountEventOrg: number
  BookingTimeEventOrg: number
  IsBookingAgent: boolean
  BookingCountAgent: number
  BookingTimeAgent: number
}
