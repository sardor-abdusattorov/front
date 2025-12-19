import { defineStore } from 'pinia'
import { toast } from 'vue3-toastify'

import {
  getCashierList,
  getPrivilagesList,
  getTariffList,
  getSessionTariffList,
  postCashMuseium,
  getIsBooking
} from '@/services/cash/cash.service'
import { getCountryList, getPaymentTypeList, getRegionList } from '@/services/region/region.service'

import { CashEventModel, TarifsModel, SessionModel, PrivilagesModel, TheatreTicketModel } from '@/services/cash/model'
import { PaymentTypeDto, RegionDto } from '@/services/region/dto/region.dto'
import { CashierDto } from '@/services/cash/dto'
import { getErrorMessage } from '@/utils/functions'

import { useI18n } from 'vue-i18n'
import { getTicketOrderPrinted, getTicketsByOrder } from '@/services/ticket/ticket.service'
import { TicketModel } from '@/services/ticket/model/ticker.model'

export const useCashierStore = defineStore('cashier', () => {
  const loading = ref<boolean>(false)
  const isReportsLoad = ref(false)
  const { t } = useI18n()

  const payload = ref<CashierDto>({
    countryId: 1,
    eventId: null,
    eventSessionId: null,
    isMultiple: false,
    paymentTypeId: null,
    regionId: null,
    ticketTariflist: []
  })

  const theatreTickets = ref<TheatreTicketModel[]>([])
  const isBooking = ref(false)
  const isBookingStatus = ref(false)

  const deletedTickets = ref<TheatreTicketModel[]>([])

  const tickets = ref<TicketModel[]>([])
  const selectedTicketIds = ref<number[]>([])
  const isSuccessPayment = ref(false)

  const privilagesList = ref<PrivilagesModel[]>([])
  const activeIndex = ref(parseInt(localStorage.getItem('activeIndex')!) || 0)

  const tarifList = ref<TarifsModel[]>([])
  const eventList = ref<CashEventModel[]>([])
  const rateList = ref<SessionModel[]>([])
  const paymentListData = ref<PaymentTypeDto[]>([])
  const countryList = ref<RegionDto[]>([])
  const regionList = ref<RegionDto[]>([])

  const defaultEventId = ref<number>(0)
  const sessionId = ref<number>(0)

  const isQuantityUpdated = ref(false)

  const selectAction = (item: number) => {
    defaultEventId.value = item
    isQuantityUpdated.value = false
    fetchSessionTarifList()
    fetchPrivilagesList()
  }

  const tariffsWithCount = computed<TarifsModel[]>(() => {
    return tarifList.value.map((item) => ({ ...item, count: item.count || 0, privilege: item.privilege || 0 }))
  })

  const loadData = async (organizationId: number) => {
    loading.value = true
    try {
      const { data } = await getCashierList(organizationId)
      eventList.value = data.result
      defaultEventId.value = data.result[activeIndex.value].eventId
      payload.value.eventId = data.result[activeIndex.value].eventId
      Promise.all([fetchSessionTarifList(), fetchPrivilagesList()])
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  const currentEvent = computed(() => {
    return eventList.value.find((item) => item.eventId === defaultEventId.value)
  })

  const loadCashierData = async () => {
    Promise.all([fetchCountryList(), fetchRegionList(), fetchPaymentTypeList()])
  }

  const fetchSessionTarifList = async () => {
    try {
      const { data } = await getSessionTariffList(defaultEventId.value)
      rateList.value = data.result
      sessionId.value = data.result[0].id
      payload.value.eventSessionId = data.result[0].id
      payload.value.eventId = defaultEventId.value
      fetchTarifList(sessionId.value)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const fetchTarifList = async (id: number) => {
    try {
      const { data } = await getTariffList(id)
      tarifList.value = data.result
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const fetchPrivilagesList = async () => {
    loading.value = true
    try {
      const { data } = await getPrivilagesList(defaultEventId.value)
      privilagesList.value = data.result
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  const fetchCountryList = async () => {
    try {
      const { data } = await getCountryList()
      countryList.value = data.result
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const fetchRegionList = async () => {
    try {
      const { data } = await getRegionList()
      regionList.value = data.result
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const fetchPaymentTypeList = async () => {
    try {
      const { data } = await getPaymentTypeList()
      paymentListData.value = data.result
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const addCashierMuseium = async (payload: CashierDto) => {
    loading.value = true
    try {
      const { data } = await postCashMuseium(payload)
      const { data: ticketData } = await getTicketsByOrder({
        orderId: data.result.orderId,
        isMultiple: payload.isMultiple
      })
      await getTicketOrderPrinted(data.result.orderId)
      tickets.value = ticketData.result
      isSuccessPayment.value = true
      toast.success(t('cash.success_museium'))
      await fetchTarifList(sessionId.value)
      setTimeout(() => {
        clearValues()
      }, 3000)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  }

  const clearValues = () => {
    tickets.value = []
    isSuccessPayment.value = false
    payload.value = {
      ...payload.value,
      countryId: 1,
      regionId: null,
      paymentTypeId: null,
      ticketTariflist: [],
      isMultiple: true
    }
    // 6133
  }
  const getBooking = async () => {
    try {
      const { data } = await getIsBooking()
      isBookingStatus.value = data.result.path.toLowerCase() !== 'false'
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    }
  }
  return {
    loadData,
    loadCashierData,
    selectAction,
    fetchRegionList,
    loading,
    privilagesList,
    tarifList,
    eventList,
    payload,
    rateList,
    countryList,
    regionList,
    paymentListData,
    tariffsWithCount,
    isQuantityUpdated,
    addCashierMuseium,
    isSuccessPayment,
    tickets,
    clearValues,
    selectedTicketIds,
    theatreTickets,
    isBooking,
    getBooking,
    isBookingStatus,
    isReportsLoad,
    currentEvent,
    deletedTickets,
  }
})
