<template>
  <div class="theatre-hall">
    <template v-if="!isLoading">
      <div class="theatre-hall-name">
        <h4>{{ event.eventName }}</h4>
        <p>
          {{ event.palaceName }}, {{ event.palaceHallName }}
          <span>{{ dayjs(event.eventBegin).format(DATE_TIME_FORMAT) }}</span>
        </p>
      </div>
      <div class="theatre-hall-seats">
        <div
          class="theatre-hall-seats__row"
          :style="{ borderColor: colorForAllTickets }"
          @click="clickTarifHandler(colorForAllTickets)"
        >
          <span>{{ t('cash.allTickets') }}</span>
        </div>
        <div
          class="theatre-hall-seats__row"
          v-for="list in filteredTarifList"
          :key="list.id"
          :style="{ borderColor: list.color }"
          @click="clickTarifHandler(list.color)"
        >
          <span>{{
            list.price === 0 ? t('report.statisticsTicket.invitationTicket') : formatMoney(list.price) + ' UZS'
          }}</span>
        </div>
      </div>
    </template>
    <base-spinner v-else />

    <div class="map" :key="sessionId" id="map"></div>
  </div>
</template>

<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

import { formatMoney, getErrorMessage } from '@/utils/functions'
import { TicketSessionList } from '@/services/ticket/model/ticker.model'
import { useTooltip } from '@/composables/useTooltip'
import { TarifsModel } from '@/services/cash/model'
import {
  addTicket,
  checkIsBooking,
  getSessionSvg,
  getSessionTicketList,
  removeTicket
} from '@/services/cash/cash.service'
import { toast } from 'vue3-toastify'
import dayjs from 'dayjs'
import { DATE_TIME_FORMAT } from '@/constants/formats'
import { useI18n } from 'vue-i18n'
import { useCashierStore } from '@/stores/cashier.store'
import { useCountDown } from '@/stores/countdown.store'
import { useUserStore } from '@/stores/user.store'

import { onMounted, watch } from 'vue'

const props = defineProps<{
  sessionId: number
  event: { eventBegin: string; palaceName: string; palaceHallName: string; eventName: string }
  sessionTarifList: TarifsModel[]
}>()

const { renderTooltip } = useTooltip()
const store = useCashierStore()
const { t } = useI18n()
const userStore = useUserStore()
const cdStore = useCountDown()

const svgText = ref('')

const ticketList = ref<TicketSessionList[]>([])
const map = ref<L.Map>()
const isLoading = ref(false)
const colorForAllTickets = 'rgb(251, 133, 2)'

const isNigohUser = computed(() => userStore.user?.organizationId === 319)

const filteredTarifList = computed(() => {
  return props.sessionTarifList.filter((tarif) => isNigohUser.value || tarif.tarifType !== 2)
})

const getSvgText = async () => {
  try {
    const { data } = await getSessionSvg(props.sessionId)
    svgText.value = data.result.svgText
    createSvgOverlay()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const getTicketList = async () => {
  try {
    const { data } = await getSessionTicketList(props.sessionId)
    ticketList.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const drawTicketList = (div: HTMLDivElement) => {
  if (ticketList.value.length === 0) return

  const renderer = {
    addClass: (element: Element, className: string) => element.classList.add(className),
    setAttribute: (element: Element, name: string, value: string) => element.setAttribute(name, value)
  }

  ticketList.value.forEach((info: TicketSessionList) => {
    const element = div.querySelector(`#seat-${info.seatId}`) as SVGGElement | null
    const path = element && (element.querySelector('path') as SVGPathElement | null)

    if (!path) return

    const isNigohUser = userStore.user?.organizationId === 319

    if (info.tarifType === 2 && !isNigohUser) {
      path.style.fill = '#3D3D3B'
      renderer.setAttribute(element, 'ticket-id', info.ticketId.toString())
      return
    }

    path.style.fill = info.isFondRejected ? '#9A9797' : info.color
    element.style.cursor = 'pointer'
    renderer.addClass(element, 'available')
    renderer.setAttribute(element, 'ticket-id', info.ticketId.toString())

    renderTooltip(element, info)
  })
}

const clickTarifHandler = async (color: string) => {
  await getTicketList()
  if (colorForAllTickets !== color) {
    ticketList.value = ticketList.value.filter((item) => item.color === color)
  }

  createSvgOverlay()
  availableTicketsClickHanlder()
}

import { nextTick } from 'vue'

const createSvgOverlay = async () => {
  if (map.value) {
    map.value.off()
    map.value.remove()
    map.value = undefined
  }
  await nextTick()

  const mapContainer = document.getElementById('map')
  if (!mapContainer) {
    console.warn('❌ Map container not found, skipping Leaflet init')
    return
  }

  mapContainer.innerHTML = ''
  // @ts-ignore
  if (mapContainer._leaflet_id) {
    // @ts-ignore
    delete mapContainer._leaflet_id
  }
  const svgElement = document.createElement('div') as any
  map.value = L.map(mapContainer, {
    zoomControl: true,
    attributionControl: false,
    doubleClickZoom: false,
    maxZoom: 9,
    minZoom: 5
  }).setView({ lat: 25, lng: -115 }, 6)

  const svgElementBounds: L.LatLngBoundsExpression = [
    [31, -130],
    [13, -100]
  ]

  svgElement.innerHTML = svgText.value

  L.svgOverlay(svgElement, svgElementBounds, { interactive: true, zIndex: 0 }).addTo(map.value)

  drawTicketList(svgElement)
}

const availableTicketsClickHanlder = () => {
  const availables = document.querySelectorAll('.available')
  availables.forEach((element) => {
    const path = element.querySelector('path')!
    const initialColor = path?.style.fill!
    element.addEventListener('click', async () => {
      const seatId = element.getAttribute('ticket-id')
      const isSelected = path?.style.fill === 'green'
      async function after() {
        path['style'].fill = isSelected ? initialColor : 'green'
        await getTicketList()
        const svgElement = document.createElement('div') as any
        svgElement.innerHTML = svgText.value
        drawTicketList(svgElement)
      }

      !isSelected ? await addTicketToList(seatId!, initialColor, after) : await removeTicketFromList(seatId!, after)
    })
  })
}

watch(
  () => store.deletedTickets,
  () => {
    const availables = document.querySelectorAll('.available')

    availables.forEach((element) => {
      const path = element.querySelector('path')
      if (!path) return
      const rowNumber = Number(element.getAttribute('data-row'))
      const seatNumber = Number(element.getAttribute('data-seat'))
      const tickId = Number(element.getAttribute('ticket-id'))

      const isDeleted = store.deletedTickets.some(
        (ticket) =>
          ticket.rowNumber === rowNumber && ticket.seatNumber === seatNumber && ticket.eventTicketId === tickId
      )
      const isAvailable = !store.theatreTickets.some(
        (ticket) =>
          ticket.rowNumber === rowNumber && ticket.seatNumber === seatNumber && ticket.eventTicketId === tickId
      )

      if (isDeleted && isAvailable) {
        path.style.fill =
          store.deletedTickets.find((item) => item.rowNumber === rowNumber && item.seatNumber === seatNumber)?.color ||
          path.style.fill
      }
    })
  },
  { deep: true }
)

watch(
  () => userStore.user,
  (newUser) => {
    if (newUser && svgText.value && ticketList.value.length > 0) {
      createSvgOverlay()
      availableTicketsClickHanlder()
    }
  },
  { immediate: true }
)
watch(
  () => props.sessionId,
  async (newSessionId, oldSessionId) => {
    if (!newSessionId || newSessionId === oldSessionId) return

    isLoading.value = true
    try {
      ticketList.value = []
      svgText.value = ''
      if (map.value) {
        map.value.off()
        map.value.remove()
        map.value = undefined
      }

      await getTicketList()
      await getSvgText()

      availableTicketsClickHanlder()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      isLoading.value = false
    }
  }
)


const addTicketToList = async (seatId: string, color: string, fn: () => void = () => {}) => {
  if (store.theatreTickets.length >= 30) return toast.warning(t('tickets.tooManyTickets'))
  try {
    const { data } = await addTicket(seatId)
    store.theatreTickets.push({
      ...data.result,
      fullName: '',
      phone: '',
      passportPnfl: '',
      passportSerial: '',
      passportNumber: '',
      color: color
    })
    cdStore.startCountdown(store.theatreTickets[store.theatreTickets.length - 1].bookingTime)
    toast.success(t('messages.added_success'))
    const { data: isBooking } = await checkIsBooking()
    store.isBooking = isBooking.result.path === 'TRUE'
    fn()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const removeTicketFromList = async (seatId: string, fn: () => void = () => {}) => {
  try {
    const orderTicketId = store.theatreTickets.find((item) => item.eventTicketId === Number(seatId))?.orderTicketId
    if (!orderTicketId) return
    const { data } = await removeTicket(orderTicketId)
    if (data.result.success) {
      toast.warning(t('messages.deleted_success'))
      store.theatreTickets = store.theatreTickets.filter((item) => item.eventTicketId !== Number(seatId))
      if (store.theatreTickets.length <= 0) {
        clearInterval(cdStore.countdownInterval)
        cdStore.countdown.isVisible = false
      }
      fn()
    }
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    await getTicketList()
    await getSvgText()
  } finally {
    isLoading.value = false
  }

  store.deletedTickets = []
  availableTicketsClickHanlder()
})

onUnmounted(() => {
  map.value?.remove()
})
</script>

<style lang="scss" scoped>
.theatre-hall {
  margin: 16px 0;

  .map {
    width: 100%;
    aspect-ratio: 16 / 9;
  }

  &-name {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 16px;
    gap: 24px;

    h4 {
      font-size: 20px;
    }

    p {
      font-size: 16px;
      font-weight: 700;

      span {
        font-weight: 400;
      }
    }
  }

  &-seats {
    flex-flow: row wrap;
    display: flex;

    &__row {
      flex: 1 0 0%;
      display: flex;
      flex-direction: column;
      min-width: 0;
      border-top: 8px solid transparent;
      padding: 10px 0;
      text-align: center;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;

      span {
        text-align: center;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
      }
    }
  }
}
</style>
