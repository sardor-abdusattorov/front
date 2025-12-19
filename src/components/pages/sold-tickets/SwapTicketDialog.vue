<template>
  <v-card width="100%" height="100%">
    <template #title>
      <div class="d-flex justify-space-between align-center ga-2 flex-column flex-md-row">
        <span>{{ t('tickets.swap_tickets') }}</span>
        <ul class="list" v-if="ticket">
          <li>
            <strong>{{ t('cash.event') }}:</strong> {{ ticket?.eventName }}
          </li>
          <li>
            <strong>{{ t('events.palace') }}:</strong> {{ ticket?.palaceName }}
          </li>
          <li>
            <strong>{{ t('commissionReport.time') }}:</strong>
            {{ ticket?.time }} - {{ ticket?.day }}.{{ ticket?.month }}.{{ ticket?.year }}
          </li>
        </ul>
      </div>
    </template>
    <template #text>
      <v-divider class="mb-5"></v-divider>
      <div class="d-flex flex-column h-100">
        <div class="wrapper">
          <div class="position-relative w-100 h-100">
            <base-spinner position="absolute" class="w-100 h-100" v-if="loading" />
            <div class="map w-100 h-100" id="map"></div>
          </div>

          <div class="content">
            <div class="content-inner">
              <swap-ticket-card :title="t('tickets.current_ticket')" :ticket="ticket" status="bought" v-if="ticket" />
              <swap-ticket-card
                :title="t('tickets.ticket_to_exchange')"
                :ticket="selectedTicket"
                status="to-swap"
                v-if="selectedTicket"
              >
                <base-button class="mt-4 w-100" @click="exchangeHandler">{{ t('tickets.swap') }}</base-button>
              </swap-ticket-card>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #actions>
      <v-btn type="button" @click="emit('close')">{{ t('cancel') }}</v-btn>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import { useI18n } from 'vue-i18n'
import { exchangeTicket, getExchangeTickets, getTicketById } from '@/services/ticket/ticket.service'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { TicketModel, TicketSessionList } from '@/services/ticket/model/ticker.model'
import { getSessionSvg, getTariffList } from '@/services/cash/cash.service'
import { TarifsModel } from '@/services/cash/model'
import { useTooltip } from '@/composables/useTooltip'

interface NewTicket extends TicketModel {
  newTicketId: number
}

const props = defineProps<{ ticketId: number }>()
const emit = defineEmits(['close', 'closeAndTriggerLoadData'])

const { t } = useI18n()
const { renderTooltip } = useTooltip()
const map = ref<L.Map>()

const ticket = ref<TicketModel | null>(null)
const selectedTicket = ref<NewTicket | null>(null)
const ticketList = ref<TicketSessionList[]>([])
const tariffList = ref<TarifsModel[]>([])
const svgText = ref('')
const loading = ref(false)

const fetchTicketById = async () => {
  try {
    const { data } = await getTicketById(props.ticketId)
    ticket.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchExchangeTickets = async () => {
  try {
    const { data } = await getExchangeTickets(props.ticketId)
    ticketList.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const getSvgText = async (sessionId: number) => {
  try {
    const { data } = await getSessionSvg(sessionId)
    svgText.value = data.result?.svgText
    createSvgOverlay()
    availableTicketsClickHanlder()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchTariffList = async (sessionId: number) => {
  try {
    const { data } = await getTariffList(sessionId)
    tariffList.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const exchangeHandler = async () => {
  if (!selectedTicket.value) return
  try {
    loading.value = true
    await exchangeTicket({
      newEventTicketId: selectedTicket.value.newTicketId,
      orderTicketId: props.ticketId
    })
    toast.success(t('tickets.exchanged_success'))
    emit('closeAndTriggerLoadData')
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

const createSvgOverlay = () => {
  if (map.value) {
    map.value.remove()
  }

  const svgElement = document.createElement('div') as any
  map.value = L.map('map', {
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
    path.style.fill = info.isFondRejected ? '#9A9797' : info.color

    element.style.cursor = 'pointer'
    renderer.addClass(element, 'available')
    renderer.setAttribute(element, 'ticket-id', info.ticketId.toString())

    renderTooltip(element, info, 'v-dialog')
  })
}

const availableTicketsClickHanlder = () => {
  const availables = document.querySelectorAll('.available')
  availables.forEach((element) => {
    const path = element.querySelector('path')!
    const initialColor = path?.style.fill!
    element.addEventListener('click', async () => {
      let ticketId = element.getAttribute('ticket-id')
      let sector = element.getAttribute('data-sector')
      let seatId = element.getAttribute('data-seat')
      let row = element.getAttribute('data-row')

      availables.forEach((element) => {
        const path = element.querySelector('path')!
        path.style.fill = initialColor
      })
      path.style.fill = 'green'
      if (ticketId) {
        selectedTicket.value = {
          ...ticket.value!,
          newTicketId: +ticketId,
          seat: seatId,
          row: row,
          sectorName: sector
        }
      }
    })
  })
}

onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([fetchExchangeTickets(), fetchTicketById()])
    if (ticket.value) {
      const sessionId = ticket.value.eventSessionId
      Promise.all([fetchTariffList(sessionId), getSvgText(sessionId)])
    }
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 24px;
  font-size: 16px;
}
.wrapper {
  position: relative;
  gap: 24px;
  flex: 1;
  display: grid;
  grid-template-columns: 70% calc(30% - 24px);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
  .map {
    @media (max-width: 767px) {
      min-height: 250px;
    }
  }

  .content {
    overflow: hidden;
    position: relative;

    @media (max-width: 767px) {
      overflow: visible;
    }

    &-inner {
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;

      @media (max-width: 767px) {
        position: static;
      }
    }
  }
}
</style>
