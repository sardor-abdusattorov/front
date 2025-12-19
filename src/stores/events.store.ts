import { CreateEventModel } from '@/services/events/dto/events.dto'
import {
  deleteEventPrivileges,
  deleteEventRejectRateRate,
  getAllEventById,
  getAllEventRoundWithDiscount,
  getTicketRejectById,
  updateEventPrivileges,
  updateEventRejectRateRate
} from '@/services/events/events.service'
import { RejectTicketModel } from '@/services/events/model/events.model'
import { getErrorMessage } from '@/utils/functions'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

export type FinesType = {
  hour: number | null
  percent: number | null
  isUpdated: boolean
  id?: number | undefined
}

export type BenefitsType = {
  name: string | null
  rate: number | null
  isUpdated: boolean
  id?: number | undefined
}

export type EventType = {
  name: string | null
  id: number | undefined
}

export const useEventsStore = defineStore('events', () => {
  const fines = ref<FinesType[]>([])
  const benefits = ref<BenefitsType[]>([])
  const benefitsCheckboxQuery = ref({ privilegesRound: '', isUseDiscountToPrivileges: false })
  const event = ref<EventType>({ name: null, id: undefined })

  const storedSvg = ref({ svgText: '', svgJson: '' })

  const storedEvent = ref<CreateEventModel>()

  const { t } = useI18n()

  const isEdit = computed(() => !!event.value.id)

  const updateFineField = async (dto: { index: number; isUpdated: boolean; id?: number }) => {
    fines.value[dto.index].isUpdated = dto.isUpdated

    if (event.value.id && !dto.isUpdated) {
      try {
        const { data } = await updateEventRejectRateRate({
          eventId: event.value.id!,
          eventName: event.value.name!,
          hour: +fines.value[dto.index].hour!,
          percent: +fines.value[dto.index].percent!,
          isEdited: true,
          submitTicketReject: true,
          id: dto.id
        })
        if (data.result.success) {
          toast.success(t('success_updated'))
        }
      } catch (err) {
        toast.error(getErrorMessage(err))
      }
    }
  }
  const removeFineField = async (dto: { index: number; id?: number }) => {
    if (!!event.value.id && dto.id) {
      try {
        const { data } = await deleteEventRejectRateRate(dto.id)
        if (data.result.success) {
          toast.success(t('success_deleted'))
        }
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        fetchRejectedTicketsById(event.value.id!)
      }
    } else {
      fines.value.splice(dto.index, 1)
    }
  }

  const updateBenefitField = async (dto: { index: number; isUpdated: boolean; id?: number }) => {
    benefits.value[dto.index].isUpdated = dto.isUpdated
    if (event.value.id && !dto.isUpdated) {
      try {
        const { data } = await updateEventPrivileges([
          {
            eventId: event.value.id!,
            eventName: event.value.name!,
            name: benefits.value[dto.index].name!,
            rate: +benefits.value[dto.index].rate!,
            isEdited: true,
            submit: true,
            id: dto.id
          }
        ])
        if (data.result.success) {
          toast.success(t('success_updated'))
        }
      } catch (err) {
        toast.error(getErrorMessage(err))
      }
    }
  }
  const removeBenefitField = async (dto: { index: number; id?: number }) => {
    if (!!event.value.id && dto.id) {
      try {
        const { data } = await deleteEventPrivileges(dto.id)
        if (data.result.success) {
          toast.success(t('success_deleted'))
        }
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        getEventPrivalilages(event.value.id!)
      }
    } else {
      benefits.value.splice(dto.index, 1)
    }
  }

  const fetchRejectedTicketsById = async (id: number) => {
    try {
      const { data } = await getTicketRejectById(id)
      fines.value = data.result.map((item: RejectTicketModel) => ({
        hour: +item.hour,
        percent: +item.percent,
        isUpdated: false,
        id: item.id
      }))
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const getEventPrivalilages = async (id: number) => {
    try {
      const [privilages, discounts] = await Promise.all([getAllEventById(id), getAllEventRoundWithDiscount(id)])

      benefits.value = privilages.data.result.data.map((item: any) => ({
        name: item.name,
        rate: +item.rate,
        isUpdated: false,
        id: item.id
      }))
      benefitsCheckboxQuery.value = {
        privilegesRound: discounts.data.result.privilegesRound.toString(),
        isUseDiscountToPrivileges: discounts.data.result.isUseDiscountToPrivileges
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return {
    fines,
    benefits,
    benefitsCheckboxQuery,
    updateFineField,
    removeFineField,
    updateBenefitField,
    removeBenefitField,
    isEdit,
    event,
    storedEvent,
    fetchRejectedTicketsById,
    getEventPrivalilages,
    storedSvg
  }
})
