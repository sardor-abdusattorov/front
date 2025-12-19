<template>
  <div class="text-center pa-4">
    <v-dialog v-model="isModalOpen" transition="dialog-bottom-transition" fullscreen>
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn prepend-icon="mdi-cog" size="small" text="Settings" v-bind="activatorProps"></v-btn>
      </template>

      <v-card class="modal-card">
        <v-toolbar>
          <v-toolbar-title>{{ formValue.name }}</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-toolbar-items>
            <v-btn icon="mdi-close" variant="text" @click="closeModal"></v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-divider></v-divider>

        <!-- Mobile Session Selector (показывается только на мобилке) -->
        <div class="mobile-select pa-4 d-md-none">
          <base-select
            v-model="selectedSession"
            :items="props.sessionList"
            item-title="name"
            item-value="id"
            :placeholder="t('report.statisticsTicket.session')"
            variant="outlined"
            density="comfortable"
          >
            <template #item="{ item }">
              <div class="d-flex align-center justify-space-between w-100">
                <span>{{ item.name }}</span>
                <v-chip
                  v-if="item.active"
                  color="success"
                  variant="tonal"
                  size="x-small"
                  prepend-icon="mdi-check-circle"
                >
                  {{ t('active') }}
                </v-chip>
              </div>
            </template>
          </base-select>
        </div>

        <div class="d-flex flex-wrap flex-md-nowrap content-wrapper">
          <!-- LEFT MAP PANEL -->
          <div class="map-panel flex-grow-1 pa-6">
            <div class="map" id="map"></div>
          </div>

          <!-- RIGHT INFO PANEL -->
          <div class="info-panel">
            <div class="info-panel-content pa-6">
              <div class="mb-6 d-none d-md-block">
                <base-select
                  v-model="selectedSession"
                  :items="props.sessionList"
                  item-title="name"
                  item-value="id"
                  :placeholder="t('report.statisticsTicket.session')"
                  variant="outlined"
                  density="comfortable"
                >
                  <template #item="{ item }">
                    <div class="d-flex align-center justify-space-between w-100">
                      <span>{{ item.name }}</span>
                      <v-chip
                        v-if="item.active"
                        color="success"
                        variant="tonal"
                        size="x-small"
                        prepend-icon="mdi-check-circle"
                      >
                        {{ t('active') }}
                      </v-chip>
                    </div>
                  </template>
                </base-select>
              </div>

              <!-- Session Info (показывается только когда выбрана сессия) -->
              <template v-if="selectedSession && selectedSessionInfo">
                <div class="mb-6">
                  <div class="d-flex align-center gap-2 mb-3">
                    <v-chip
                      v-if="selectedSessionInfo.active"
                      color="success"
                      variant="flat"
                      prepend-icon="mdi-check-circle"
                      size="small"
                    >
                      {{ t('active') }}
                    </v-chip>
                  </div>

                  <!-- Время сеанса -->
                  <div class="detail-item mb-3">
                    <div class="text-caption text-medium-emphasis mb-1">{{ t('commissionReport.time') }}</div>
                    <div class="text-body-2">{{ formatSessionTime(selectedSessionInfo) }}</div>
                  </div>

                  <!-- Период продажи -->
                  <div class="detail-item">
                    <div class="text-caption text-medium-emphasis mb-1">
                      {{ t('sessions.sessionBeginSaleDate') }} - {{ t('sessions.sessionEndSaleDate') }}
                    </div>
                    <div class="text-body-2">
                      {{ formatDate(selectedSessionInfo.beginSale) }} — {{ formatDate(selectedSessionInfo.endSale) }}
                    </div>
                  </div>
                </div>

                <v-divider class="my-4" />

                <!-- Statuses -->
                <div class="mb-4">
                  <h4 class="text-subtitle-1 mb-3">{{ t('statuses') }}</h4>
                  <ul class="color-legend">
                    <li class="legend-item" v-for="status in statuses" :key="status.value">
                      <div class="color-box" :style="{ backgroundColor: status.color }"></div>
                      <span>{{ t(status.name) }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Tariffs -->
                <div>
                  <h4 class="text-subtitle-1 mb-3">
                    {{ t('tariffs.title') }}
                    <span class="text-caption text-medium-emphasis ml-1">({{ sessionTarifList.length }})</span>
                  </h4>
                  <div class="tariffs-scroll-container">
                    <ul class="color-legend">
                      <li v-for="(item, index) in sessionTarifList" :key="index" class="legend-item">
                        <div class="color-box" :style="{ backgroundColor: item.color }"></div>
                        <span>{{ formatPrice(item.price) }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>

              <!-- Placeholder когда сессия не выбрана -->
              <template v-else>
                <div class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-calendar-clock</v-icon>
                  <div class="text-body-1 text-medium-emphasis">
                    {{ t('report.statisticsTicket.session') }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

import { useI18n } from 'vue-i18n'
import { DATE_TIME_FORMAT } from '@/constants/formats'
import { getAllTicketsForSetTarif, getEventSessionTarifs } from '@/services/tarif/tarif.service'
import { toast } from 'vue3-toastify'
import { getErrorMessage } from '@/utils/functions'
import { EventSeatForSetTarif } from '@/services/tarif/model/tarif.model'
import { TicketStatus } from '@/constants/ticket-statuses'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const props = defineProps<{
  formValue: any
  sessionList?: any[]
  palaceHall: any
}>()

const { t } = useI18n()
const isModalOpen = ref(false)
const map = ref<L.Map>()
const selectedSession = ref()
const seatTarifColoredType = ref<EventSeatForSetTarif[]>([])
const sessionTarifList = ref<any[]>([])

const selectedSessionInfo = computed(() => props.sessionList?.find((s) => s.id === selectedSession.value))

const statuses = computed(() => [TicketStatus.BRON, TicketStatus.SALE, TicketStatus.USED, TicketStatus.FOND_REJECTED])

function formatPrice(price: number) {
  return new Intl.NumberFormat().format(price)
}

function formatSessionTime(session?: any) {
  if (!session) return ''
  return dayjs(session.eventBegin).format(DATE_TIME_FORMAT) + ' — ' + dayjs(session.eventEnd).format(DATE_TIME_FORMAT)
}

const createSvgOverlay = () => {
  const mapContainer = document.getElementById('map')
  if (!mapContainer) return
  if (map.value) map.value.remove()

  const svgElement = document.createElement('div') as any
  map.value = L.map('map', {
    zoomControl: true,
    attributionControl: false,
    doubleClickZoom: false,
    maxZoom: 8,
    minZoom: 4
  }).setView({ lat: 25, lng: -115 }, 5)

  const svgElementBounds: L.LatLngBoundsExpression = [
    [31, -130],
    [13, -100]
  ]

  svgElement.innerHTML = props.palaceHall.svgText
  drawSeats(svgElement)
  L.svgOverlay(svgElement, svgElementBounds, { interactive: true, zIndex: 0 }).addTo(map.value)
}

function formatDate(date?: string) {
  if (!date) return ''
  return dayjs(date).format(DATE_TIME_FORMAT)
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

const getAllTicketsForSetTariff = async () => {
  try {
    const { data } = await getAllTicketsForSetTarif(selectedSession.value)
    seatTarifColoredType.value = data.result
    if (isModalOpen.value) createSvgOverlay()
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const getAllEventSessionTariff = async () => {
  try {
    const { data } = await getEventSessionTarifs({ eventSessionId: selectedSession.value, skip: 0, take: 1000 })
    sessionTarifList.value = data.result.data
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

const closeModal = () => {
  if (map.value) {
    map.value.remove()
    map.value = undefined
  }
  isModalOpen.value = false
  selectedSession.value = null
}

const openModal = () => (isModalOpen.value = true)

defineExpose({ openModal })

watch(
  () => selectedSession.value,
  async (newSession) => {
    if (newSession) await Promise.all([getAllEventSessionTariff(), getAllTicketsForSetTariff()])
  }
)
</script>

<style scoped>
.modal-card {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.mobile-select {
  background-color: #fafafa;
  border-bottom: 1px solid #eee;
}

.map-panel {
  flex: 1;
  background: #fff;
  overflow: hidden;
  min-height: 0;
}

#map {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.info-panel {
  background-color: #fafafa;
  border-left: 1px solid #eee;
  width: 380px;
  min-width: 380px;
  max-width: 380px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.info-panel-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.detail-item {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.color-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-box {
  width: 60px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.tariffs-scroll-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.tariffs-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.tariffs-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tariffs-scroll-container::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 3px;
}

.tariffs-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Mobile styles */
@media (max-width: 960px) {
  .info-panel {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    border-left: none;
    border-top: 1px solid #eee;
    max-height: 50vh;
  }

  .map-panel {
    height: 50vh;
  }

  .tariffs-scroll-container {
    max-height: 200px;
  }
}
</style>
