<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:model-value', $event)" width="95vw"
    height="95vh">
    <v-card height="100%" width="100%" :title="t('scheme')">
      <template #text>
        <v-divider class="mb-5"></v-divider>
        <div class="d-flex flex-column h-100">
          <ul class="list">
            <li>
              <strong>{{ t('cash.event') }}:</strong> {{ store.storedEvent?.name }}
            </li>
            <li>
              <strong>{{ t('commissionReport.time') }}:</strong>
              {{ dayjs(start).format(DATE_TIME_FORMAT) }} -
              {{ dayjs(stop).format(DATE_TIME_FORMAT) }}
            </li>
            <li>
              <strong>{{ t('report.statisticsTicket.session') }}:</strong> {{ sessionName }}
            </li>
          </ul>

          <div class="wrapper">
            <div class="map" id="map"></div>

            <div class="content">
              <div class="content-inner">
                <ul class="tarifs">
                  <li class="tarifs-list" v-for="status in statuses" :key="status.value">
                    <div class="color" :style="{ backgroundColor: status.color }"></div>
                    <div class="text">{{ t(status.name) }}</div>
                  </li>
                </ul>
                <v-divider class="my-2"></v-divider>
                <div class="tarifs">
                  <label class="tarifs-list" v-for="tarif in tariffs" :key="tarif.id">
                    <input type="radio" :id="tarif.id.toString()" :name="tarif.name" :value="tarif"
                      v-model="selectedTarif" :disabled="userStore.isSuperUser" />
                    <div class="color" :style="{ backgroundColor: tarif.color }"></div>
                    <div class="text">
                      {{ tarif.name }} - {{ tarif.price > 0 ? formatMoney(tarif.price) : t('cash.free') }}
                    </div>
                  </label>
                  <label class="tarifs-list">
                    <input type="radio" :value="defaultChecked" v-model="selectedTarif"
                      :id="selectedTarif?.id.toString()" :name="selectedTarif?.name"
                      :disabled="userStore.isSuperUser" />
                    <div class="color" :style="{ backgroundColor: '#000000' }"></div>
                    <div class="text">{{ t('tickets.cancel_seats') }}</div>
                  </label>
                </div>
                <base-button v-if="
                  (eventSeatTariffsToAdd.length > 0 || eventSeatTariffsToDelete.length > 0) && !userStore.isSuperUser
                " @click="submitHandler" :loading="submitLoading" class="save-btn">{{ t('actions.save_changes')
                  }}</base-button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:actions>
        <v-btn class="ms-auto" :text="t('actions.close')" @click="emit('update:model-value', false)"></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import DragSelect from 'dragselect'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue3-toastify'

import { DATE_TIME_FORMAT } from '@/constants/formats'
import { formatMoney, getErrorMessage } from '@/utils/functions'
import { TicketStatus } from '@/constants/ticket-statuses'

import { useEventsStore } from '@/stores/events.store'
import { useUserStore } from '@/stores/user.store'

import { getPalaceHallById } from '@/services/palace/palace.service'
import { PalaceHallModel } from '@/services/palace/model/palace.model'

import {
  eventTicketAdd,
  eventTicketDelete,
  getAllTicketsForSetTarif,
  getEventId,
  getEventSessionTarifs
} from '@/services/tarif/tarif.service'
import { EventSeatForSetTarif, EventSeatTariff, TarifsModel } from '@/services/tarif/model/tarif.model'

const props = defineProps<{ modelValue: boolean; sessionName: string; sessionId: number }>()
const emit = defineEmits(['update:model-value'])

const { t } = useI18n()
const store = useEventsStore()
const userStore = useUserStore()

const map = ref<L.Map>()
const palaceHall = ref<PalaceHallModel>()
const defaultColor = '#000000'
const submitLoading = ref(false)

const defaultChecked = ref({
  color: defaultColor,
  id: 0,
  name: '',
  price: 0,
  eventId: 0,
  eventSessionId: 0,
  created: '',
  eventName: '',
  eventSessionName: '',
  index: 0,
  userName: '',
  createUser: 0
})

const isDelete = ref(false)

const selectedTarif = ref<TarifsModel>(defaultChecked.value)

const eventSeatTariffsToAdd = ref<EventSeatTariff[]>([])
const eventSeatTariffsToDelete = ref<EventSeatTariff[]>([])
const seatTarifColoredType = ref<EventSeatForSetTarif[]>([])
const tariffs = ref<TarifsModel[]>([])
const dragSelect = ref<DragSelect<any> | null>(null)
const start = ref()
const stop = ref()

const statuses = computed(() => {
  return [TicketStatus.BRON, TicketStatus.SALE, TicketStatus.USED, TicketStatus.FOND_REJECTED]
})

const fetchDates = async () => {
  try {
    const { data } = await getEventId(props.sessionId)
    console.log(data)
    start.value = data.result.eventBegin
    stop.value = data.result.eventEnd
  }
  catch (error) {
    toast.error(getErrorMessage(error))
  }
}
fetchDates()

const fetchPalaceById = async () => {
  try {
    const { data } = await getPalaceHallById(store.storedEvent?.palaceHallId!)
    palaceHall.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchAllTicketsForSetTarif = async () => {
  try {
    const { data } = await getAllTicketsForSetTarif(props.sessionId)
    seatTarifColoredType.value = data.result
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const fetchTarifs = async () => {
  try {
    const { data } = await getEventSessionTarifs({
      eventSessionId: props.sessionId,
      take: 1000,
      skip: 0
    })
    tariffs.value = data.result.data
  } catch (error) {
    toast.error(getErrorMessage(error))
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
    maxZoom: 8,
    minZoom: 4,
    dragging: false
  }).setView({ lat: 25, lng: -115 }, 5)
  const svgElementBounds: L.LatLngBoundsExpression = [
    [31, -130],
    [13, -100]
  ]
  svgElement.innerHTML = palaceHall.value?.svgText

  drawSeats(svgElement)
  L.svgOverlay(svgElement, svgElementBounds, { interactive: true, zIndex: 0 }).addTo(map.value)

  map.value.setMaxBounds(svgElementBounds)

  map.value.on('zoomend', () => {
    map.value!.panInsideBounds(svgElementBounds, { animate: false })
  })

  map.value.on('drag', () => {
    map.value!.panInsideBounds(svgElementBounds, { animate: false })
  })

  clickSeatHandler(svgElement)

  dragSelect.value = new DragSelect({
    selectables: document.querySelectorAll('.seat') as any,
    area: svgElement.nativeElement,
    draggability: false
  })

  dragSelect.value.subscribe('DS:end', eventListener)
}

const eventListener = (e: any) => {
  e.items.forEach((item: any) => selectSeatHandler(item))
}

const drawSeats = (div: HTMLDivElement) => {
  seatTarifColoredType.value.forEach((info: EventSeatForSetTarif) => {
    const element = div.querySelector(`#seat-${info.seatId}`) as HTMLElement | null
    const path = element && (element.querySelector('path') as HTMLElement | null)

    if (!path) return

    switch (info.ticketStatusId) {
      case TicketStatus.BRON.value:
      case TicketStatus.REBRON.value:
        path.style.fill = TicketStatus.REBRON.color
        break
      case TicketStatus.SALE.value:
      case TicketStatus.RESALE.value:
        path.style.fill = TicketStatus.RESALE.color
        break
      case TicketStatus.USED.value:
        path.style.fill = TicketStatus.USED.color
        break
      case TicketStatus.FOND_REJECTED.value:
        path.style.fill = TicketStatus.FOND_REJECTED.color
        break
      default:
        path.style.fill = info.isFondRejected ? '#ff0000' : info.color
        break
    }
  })
}

const clickSeatHandler = (div: HTMLDivElement) => {
  const seats = div.querySelectorAll('.seat') as NodeListOf<HTMLElement>
  seats.forEach((seat: HTMLElement) => {
    seat.addEventListener('click', () => selectSeatHandler(seat))
  })
}

const selectSeatHandler = (seat: HTMLElement) => {
  if (!seat) return
  const path = seat.querySelector('path') as HTMLElement | null
  if (!path) return

  if (path.style.fill === selectedTarif.value?.color) return

  isDelete.value = selectedTarif.value?.id === 0
  const seatId = seat.id.split('-')[1]

  const selectedBefore = seatTarifColoredType.value.find((item: EventSeatForSetTarif) => item.seatId === +seatId)

  if (selectedBefore && selectedBefore.color === selectedTarif.value?.color) return

  if (isDelete.value) {
    const check = eventSeatTariffsToAdd.value.find((item: EventSeatTariff) => item.seatId === seatId)
    if (check) {
      eventSeatTariffsToAdd.value = eventSeatTariffsToAdd.value.filter(
        (item: EventSeatTariff) => item.seatId !== seatId
      )
    }

    const isCollected = eventSeatTariffsToDelete.value.find((item: EventSeatTariff) => item.seatId === seatId)
    if (isCollected && isCollected.seatId === seatId) {
      eventSeatTariffsToDelete.value = eventSeatTariffsToDelete.value.filter(
        (item: EventSeatTariff) => item.seatId !== seatId
      )
    }

    eventSeatTariffsToDelete.value.push({
      seatId: seatId,
      eventSessionId: props.sessionId,
      palaceHallId: palaceHall.value?.id!,
      tarifId: selectedTarif.value?.id!
    })

    path.style.fill = selectedTarif.value.color
  } else {
    const check = eventSeatTariffsToDelete.value.find((item: EventSeatTariff) => item.seatId === seatId)
    if (check) {
      eventSeatTariffsToDelete.value = eventSeatTariffsToDelete.value.filter(
        (item: EventSeatTariff) => item.seatId !== seatId
      )
    }
    const isCollected = eventSeatTariffsToAdd.value.find((item: EventSeatTariff) => item.seatId === seatId)
    if (isCollected && isCollected.seatId === seatId) {
      eventSeatTariffsToAdd.value = eventSeatTariffsToAdd.value.filter(
        (item: EventSeatTariff) => item.seatId !== seatId
      )
    }

    eventSeatTariffsToAdd.value.push({
      seatId: seatId,
      eventSessionId: props.sessionId,
      palaceHallId: palaceHall.value?.id!,
      tarifId: selectedTarif.value?.id!
    })

    path.style.fill = selectedTarif.value.color
  }
}

const submitHandler = async () => {
  try {
    submitLoading.value = true
    if (eventSeatTariffsToAdd.value.length > 0) {
      await eventTicketAdd(eventSeatTariffsToAdd.value)
    }
    if (eventSeatTariffsToDelete.value.length > 0) {
      await eventTicketDelete(eventSeatTariffsToDelete.value)
    }
    toast.success(t('contract.successfully'))
    emit('update:model-value', false)
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  eventSeatTariffsToAdd.value = []
  eventSeatTariffsToDelete.value = []
  defaultChecked.value = {
    color: defaultColor,
    id: 0,
    name: '',
    price: 0,
    eventId: 0,
    eventSessionId: 0,
    created: '',
    eventName: '',
    eventSessionName: '',
    index: 0,
    userName: '',
    createUser: 0
  }
  await Promise.all([fetchTarifs(), fetchAllTicketsForSetTarif(), fetchPalaceById()])
  createSvgOverlay()
})

onUnmounted(() => {
  dragSelect.value!?.unsubscribe('DS:end', eventListener)
  dragSelect.value!.stop()
  dragSelect.value = null
})
</script>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 24px;
}

.wrapper {
  position: relative;
  gap: 24px;
  flex: 1;
  margin-top: 20px;
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

      @media (max-width: 767px) {
        position: static;
      }
    }
  }
}

.tarifs {
  display: flex;
  flex-direction: column;
  gap: 5px;

  li {
    display: grid;
    align-items: center;
    gap: 10px;
    grid-template-columns: 46px 1fr;
    cursor: default;
  }

  &-list {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
}

.color {
  height: 28px;
  border-radius: 4px;
  min-width: 46px;
}

.text {
  font-size: 14px;
  font-weight: 400;
}

.save-btn {
  width: calc(100% - 8px);
  margin-top: 12px;
  position: sticky;
  bottom: 0px;
  left: 4px;
  right: 4px;

  z-index: 2;
}
</style>

<style>
.map,
.drag-select,
.drag-select__wrapper {
  width: 100%;
  height: 100%;
}
</style>
